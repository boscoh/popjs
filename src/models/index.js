import { EcologyModel } from './ecology-models'
import { EconModel } from './econ-models'
import { PropertyModel } from './property-model'
import { StateModel } from './state-models'
import { SirModel } from './epi-models'

let index = {}
for (let modelClass of [
    EconModel,
    EcologyModel,
    StateModel,
    SirModel,
    PropertyModel,
]) {
    let model = new modelClass()
    index[model.constructor.name] = model
}

export default index
