const { OAuthStrategy } = require('@feathersjs/authentication-oauth')
const axios = require('axios')

class TwitchStrategy extends OAuthStrategy {
  setApplication (app) {
    this.app = app
  }

  async getEntityData (profile) {
    const baseData = await super.getEntityData(profile)

    return {
      ...baseData,
      providers: [
        ...(baseData.providers ? baseData.providers : []),
        {
          source: 'twitch',
          uuid: profile.id
        }
      ],
      email: profile.email,
      displayName: profile.display_name,
      viewCount: profile.view_count,
      avatarUrl: profile.profile_image_url
    }
  }

  async getProfile (authData, _params) {
    const accessToken = authData.access_token

    const twitchResponse = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-ID': this.app.get('authentication').oauth.twitch.client_id
      },
      params: {
        fields: 'id,name,email'
      }
    })

    return twitchResponse.data.data[0] // ? wtf :D
  }

  async getEntityQuery (profile) {
    return {
      'providers.source': 'twitch',
      'providers.uuid': profile.id
    }
  }
}

module.exports = {
  TwitchStrategy
}
