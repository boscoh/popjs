import _ from 'lodash'

class BaseModel {
  /**
   * BaseModel is a compartmental model that
   * implements a system of differential equations
   * that connects the populations of the different
   * compartments.
   *
   * Most connections between compartments are
   * of the double-entry book-keeping type where
   * losses in one compartments are taken up
   * from another compartment.
   *
   * In order to handle all the connections without
   * putting too much of a burden on the programmer
   * the differential equations are built up from
   * the individual connections rather than being
   * specified straight up.
   *
   * That is dCompartment/dTime = linear function(compartment)
   *
   * 0) initializes compartments to initial variables
   *
   * The execution loop is:
   *
   * 1) externally add to this.delta of compartments
   *    due to extrinsic import of people, via this.transferTo
   * 2) recalculate this.var - should
   *    depends only on this.param and
   *    current this.compartment values
   * 3) Generate all events - single changes to
   *    to compartments, or paired changes to two
   *    compartments. The amount of changes in each
   *    event should be proportional to:
   *      - compartments
   *      - params
   *      - var
   * 4) Events are added to this.delta
   * 5) Deltas are multiplied by a time factor
   * 6) Compartments updated
   * 7) Chosen this.compartments and this.var at
   *    the given time-point
   *    to be saved in this.solutions
   */
  constructor(id) {
    // Name of the particular instance of the model
    this.id = id

    this.modelType = 'BASE'

    // Keys are names of the compartments in the model
    this.keys = []

    // Dictionary to hold the population of each
    // compartment. Each compartment is represented
    // by the key of the compartment.
    // There are two key compartments that are
    // assumed in other parts of the app:
    //   1. infectious
    //   2. susceptible
    this.compartment = {
      infectious: 0,
      susceptible: 0
    }

    // Current time point of the simulation
    this.startTime = 0
    this.time = 0

    // The time-points that are used for the simulation
    // Since this will use a simple Newtownain time-step,
    // the time-points define the time steps used in
    // propagating the simulation
    this.times = []

    // Parameters are constant values that are used in
    // the calculation of the differentials in the
    // time propagation. Each parameter will be referred
    // by a key
    this.param = {}

    // List of parameters that will be exported to a
    // GUI and used as a template to return values
    // to input into this.param
    this.guiParams = [
      // {
      //   key: 'initPrevalence',
      //   value: 3000,
      //   interval: 1,
      //   placeHolder: '',
      //   label: 'Prevalence'
      // }
    ]

    // List of parameters that will be exported to a
    // GUI and used as a template to return values
    // to input into this.param
    this.interventionParams = [
      // Must have an interventionDay for the GUI
      // to recognize interventions properly
      // {
      //   key: 'interventionDay',
      //   value: 5,
      //   interval: 1,
      //   placeHolder: '',
      //   label: 'Intervertion Start Day'
      // },
      // {
      //   key: 'reproductionNumber',
      //   value: 1.5,
      //   interval: 0.01,
      //   placeHolder: '',
      //   label: 'R0'
      // },
    ]

    // Stores any variables that need to be dynamically
    // calculated from the compartments at a time-step
    this.var = {}

    // The delta for each compartment is the amount
    // it will change at a particular time-point.
    // this.delta can be set externally at the
    // beginning of each this.updateCompartment
    this.delta = {}

    // List of all events between compartments
    // that rely on dynamically calculated parameters
    this.varEvents = []

    // List of all events between compartments
    // that are proportional to constants in this.param
    this.paramEvents = []

    // This is a list of all transfers between
    // compartments, with the actual size of the
    // differentials at the current time-points
    this.events = []

    // The transfer for each compartment, which
    // will be constructed from this.events
    this.flow = {}

    // Stored list of variables for further analysis
    this.solution = {
      infectious: [],
      susceptible: [],
      rn: [],
      recovered: [],
      incidence: [],
      importIncidence: []
    }
  }

  /**
   * Convenient function to return GUI-friendly
   * list of parameters to modify
   *
   * @returns list[{}] paramEntries
   */
  getGuiParams() {
    return _.cloneDeep(this.guiParams)
  }

  /**
   * Convenient function to return GUI-friendly
   * list of parameters to modify
   *
   * @returns list[{}] paramEntries
   */
  getInterventionParams() {
    if (this.interventionParams.length > 0) {
      return _.cloneDeep(this.interventionParams)
    } else {
      return []
    }
  }

  /**
   * Allows GUI-control of the simulation, where
   * this.param are set to values provided by
   * guiParams
   *
   * @param guiParams
   */
  importGuiParams(guiParams) {
    this.param = _.cloneDeep(this.defaultParams)
    for (let param of guiParams) {
      this.param[param.key] = parseFloat(param.value)
    }
  }

  /**
   * To be overridden. Calculates new this.param from
   * existing this.param.
   */
  calcExtraParams() {}

  /**
   * To be overridden. Initializations of compartments
   * from this.param, used at the beginning of a run and typically
   * called by this.initCompartments
   */
  initCompartmentsByParams() {
    this.compartment.infectious = this.param.initPrevalence
    this.compartment.susceptible =
      this.param.initPopulation - this.param.initPrevalence
  }

  /**
   * Called before running a simulation
   */
  initCompartments() {
    this.keys = _.keys(this.compartment)
    for (let key of this.keys) {
      this.compartment[key] = 0
      this.delta[key] = 0
    }
    this.calcExtraParams()
    this.initCompartmentsByParams()
    this.checkEvents()
  }

  /**
   * Takes user-input of intervention parameters to load into the model
   * to calculate an intervention
   *
   * @param [params] - a param folds a dictionary for a value and its bounds and step
   */
  applyIntervention(guiParams) {
    for (let param of guiParams) {
      this.param[param.key] = parseFloat(param.value)
    }
    this.calcExtraParams()
  }

  /**
   * Clears solutions, compartments and times for
   * re-running the simulation from the beginning and
   * for reseting a simulation as an intervention
   */
  clearSolutions() {
    this.calcVars()
    this.solution = {}
    for (let key of _.keys(this.compartment)) {
      this.solution[key] = []
    }
    for (let key of _.keys(this.var)) {
      this.solution[key] = []
    }

    this.solution.incidence = []
    this.solution.importIncidence = []

    this.times.length = 0
  }

  /**
   * Saves the time, and current state as a function
   * of time in solution. The actual variables that
   * are saved may be calculated here.
   *
   * @param dTime
   */
  saveToSolution(dTime) {
    let incidence = 0
    for (let event of this.events) {
      let to = event[1]
      let val = event[2]
      if (to === 'infectious') {
        incidence += val * dTime
      }
    }
    this.solution.incidence.push(incidence)

    for (let key of _.keys(this.compartment)) {
      if (!isFinite(this.compartment[key])) {
        return
      }
      this.solution[key].push(this.compartment[key])
    }
    for (let key of _.keys(this.var)) {
      if (!isFinite(this.var[key])) {
        return
      }
      this.solution[key].push(this.var[key])
    }
  }

  /**
   * Overridable function to calculate this.var
   * relevant to each time-point from compartment and
   * params values.
   */
  calcVars() {}

  /**
   * Sanity check to make sure that there are suitable
   * this.var and this.param for the varEvents and
   * paramEvents that are defined.
   */
  checkEvents() {
    this.calcVars()
    let varKeys = _.keys(this.var)
    for (let varEvent of this.varEvents) {
      let varEventKey = varEvent[2]
      if (!_.includes(varKeys, varEventKey)) {
        console.log(
          `Error: ${varEventKey} of this.varEvents not ` +
            `found in this.calcVars`
        )
      }
    }
    for (let paramEvent of this.paramEvents) {
      let paramEventKey = paramEvent[2]
      let paramKeys = _.keys(this.param)
      if (!_.includes(paramKeys, paramEventKey)) {
        console.log(
          `Error: ${paramEventKey} of this.paramEvents not ` +
            `found in this.param`
        )
      }
    }
  }

  /**
   * Clears variables for transfers with other countryModels to occur
   */
  clearDelta() {
    for (let key of this.keys) {
      this.delta[key] = 0
    }
    this.var.importIncidence = 0
  }

  /**
   * Moves people out of compartments to compartments in
   * toCountryModel
   *
   * @param toCountryModel - another BaseModel
   * @param travelPerDay - number of people travelling between the two epiModels
   */
  transferTo(toCountryModel, travelPerDay) {
    let probSickCanTravel = 1
    let probTravelPerDay = travelPerDay / this.var.population
    let probSickTravelPerDay = probSickCanTravel * probTravelPerDay
    let delta = this.compartment.infectious * probSickTravelPerDay
    this.delta.infectious -= delta
    toCountryModel.delta.infectious += delta
    toCountryModel.var.importIncidence += delta
  }

  /**
   * Calculates this.events, which encode specific
   * changes between compartments. These are stored
   * to allow for both the construction of differentials
   * and to use randomized samples further down the track
   */
  calcEvents() {
    this.calcVars()

    this.events.length = 0

    for (let [from, to, varKey] of this.varEvents) {
      let val = this.var[varKey] * this.compartment[from]
      this.events.push([from, to, val])
    }

    for (let [from, to, paramKey] of this.paramEvents) {
      let val = this.param[paramKey] * this.compartment[from]
      this.events.push([from, to, val])
    }
  }

  integrateStep(dTime) {
    this.calcEvents()

    // Calculates the flow from events, which is the
    // instantaneous differential for
    // each compartment.
    for (let key of this.keys) {
      this.flow[key] = 0
    }
    for (let [from, to, val] of this.events) {
      this.flow[from] -= val
      this.flow[to] += val
    }

    // This extra step is needed to allow the
    // actual this.delta of each compartment to
    // take external values (controlled by a
    // meta simulation) from other sources.
    // The this.delta is then modified by
    // this.flow * dTime as calculated by this.calcEvents
    // this.delta is defined by a time interval dTime
    for (let key of this.keys) {
      this.delta[key] += dTime * this.flow[key]
    }

    for (let key of this.keys) {
      this.compartment[key] += this.delta[key]

      // WARNING: this is a hacky check to
      // ensure that the simulation doesn't
      // stray into negative populations if
      // it is run with too crude a time step
      if (this.compartment[key] < 0) {
        this.compartment[key] = 0
      }
    }

    this.time += dTime
    this.times.push(this.time)

    this.saveToSolution(dTime)
  }

  run(nStep = 30, dTimeInDay = 1) {
    this.clearSolutions()
    this.initCompartments()

    this.time = this.startTime
    this.times.push(this.time)
    this.saveToSolution(0)

    _.times(nStep, () => {
      this.clearDelta()
      this.integrateStep(dTimeInDay)
    })

    console.log('PopJs.run', _.keys(this.solution), _.keys(this.compartment))
  }
}

export default BaseModel
