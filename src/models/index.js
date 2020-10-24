import { EcologyModel } from './ecology-models'
import { EconModel } from './econ-models'
import { PropertyModel } from './property-model'
import { StateModel } from './state-models'
import { SirModel } from './epi-models'
import { EliteModel } from '@/models/elite-models'

let models = [
    { path: '/econmodel', name: 'Economy', ModelClass: EconModel },
    { path: '/ecologymodel', name: 'Ecology', ModelClass: EcologyModel },
    { path: '/statemodel', name: 'Demographic', ModelClass: StateModel },
    { path: '/elitemodel', name: 'Elite', ModelClass: EliteModel },
    { path: '/sirmodel', name: 'Epidemiology', ModelClass: SirModel },
    { path: '/propertymodel', name: 'Property', ModelClass: PropertyModel },
]

export default models
