import { EcologyModel } from './ecology-models'
import { EconModel } from './econ-models'
import { StateModel } from './state-models'
import { SirModel } from './epi-models'
import { EliteModel } from './elite-models'
import { FathersModel } from './fathers-model'
import _ from 'lodash'

let models = [
    { path: '/econmodel', name: 'Economy', ModelClass: EconModel },
    { path: '/ecologymodel', name: 'Ecology', ModelClass: EcologyModel },
    { path: '/sirmodel', name: 'Epidemiology', ModelClass: SirModel },
    { path: '/statemodel', name: 'Demographic', ModelClass: StateModel },
    { path: '/elitemodel', name: 'Elite', ModelClass: EliteModel },
    { path: '/fathersmodel', name: 'FathersSons', ModelClass: FathersModel },
]

for (let model of models) {
    const instance = new model.ModelClass()
    model.summary = _.get(instance, 'summary', '')
    model.title = _.get(instance, 'title', '')
    model.instance = model
}

export default models
