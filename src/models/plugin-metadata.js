import assign from 'lodash.assign'
import forEach from 'lodash.foreach'

import Collection from '../collection/redis'
import Model from '../model'

// ===================================================================

export default class PluginMetadata extends Model {}

// ===================================================================

export class PluginsMetadata extends Collection {
  get Model () {
    return PluginMetadata
  }

  get idPrefix () {
    return 'plugin-metadata:'
  }

  async save ({ id, autoload, configuration }) {
    return await this.update({
      id,
      autoload: autoload ? 'true' : 'false',
      configuration: configuration && JSON.stringify(configuration)
    })
  }

  async merge (id, data) {
    const pluginMetadata = await this.first(id)
    if (!pluginMetadata) {
      throw new Error('no such plugin metadata')
    }

    const {properties} = pluginMetadata
    assign(properties, data)
    return await this.save(properties)
  }

  async get (properties) {
    const pluginsMetadata = await super.get(properties)

    // Deserializes.
    forEach(pluginsMetadata, pluginMetadata => {
      const { autoload, configuration } = pluginMetadata
      pluginMetadata.autoload = autoload === 'true'
      try {
        pluginMetadata.configuration = configuration && JSON.parse(configuration)
      } catch (error) {
        console.warn('cannot parse pluginMetadata.configuration:', configuration)
        pluginMetadata.configuration = []
      }
    })

    return pluginsMetadata
  }
}
