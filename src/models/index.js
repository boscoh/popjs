import { EcologyModel } from './ecology-models'
import { EconModel } from './econ-models'
import { PropertyModel } from './property-model'
import { StateModel } from './state-models'
import { SirModel } from './epi-models'

let models = {
    econmodel: EconModel,
    ecologymodel: EcologyModel,
    statemodel: StateModel,
    sirmodel: SirModel,
    propertymodel: PropertyModel,
}

export default models
