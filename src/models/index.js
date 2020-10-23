import { EcologyModel } from './ecology-models'
import { EconModel } from './econ-models'
import { PropertyModel } from './property-model'
import { StateModel } from './state-models'
import { SirModel } from './epi-models'

let models = [
    { path: '/econmodel', name: 'Economy', ModelClass: EconModel },
    { path: '/ecologymodel', name: 'Ecology', ModelClass: EcologyModel },
    { path: '/statemodel', name: 'Demographic', ModelClass: StateModel },
    { path: '/sirmodel', name: 'Epidemiology', ModelClass: SirModel },
    { path: '/propertymodel', name: 'Property', ModelClass: PropertyModel },
]

export default models
