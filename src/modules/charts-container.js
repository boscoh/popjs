import $ from 'jquery'
import Chart from 'chart.js'
import _ from 'lodash'
const md = require('markdown-it')()
const mk = require('markdown-it-katex')

md.use(mk)

/**
 * Functions to generate chartJs data for model
 */

function makeLineChartData(title, xAxisLabel, yAxisLabel) {
    return {
        type: 'line',
        data: {
            datasets: [],
        },
        options: {
            title: {
                display: true,
                text: title,
            },
            legend: {
                display: true,
                position: 'right',
            },
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                xAxes: [
                    {
                        display: true,
                        type: 'linear',
                        position: 'bottom',
                        scaleLabel: {
                            display: true,
                            labelString: xAxisLabel,
                        },
                        ticks: {},
                    },
                ],
                yAxes: [
                    {
                        display: true,
                        type: 'linear',
                        scaleLabel: {
                            display: true,
                            labelString: yAxisLabel,
                        },
                    },
                ],
            },
        },
    }
}

const colors = [
    '#4ABDAC', // fresh
    '#FC4A1A', // vermilion
    '#F78733', // sunshine
    '#037584', // starry night
    '#007849', // iris
    '#FAA43A', // orange
    '#60BD68', // green
    '#F17CB0', // pink
    '#B2912F', // brown
    '#B276B2', // purple
    '#DECF3F', // yellow
    '#F15854', // red
    '#C08283', // pale gold
    '#dcd0c0', // silk
    '#E37222', // tangerine
]

let seenNames = []

function getColor(name) {
    let i = seenNames.indexOf(name)
    if (i < 0) {
        seenNames.push(name)
        i = seenNames.length - 1
    }
    return colors[i % colors.length]
}

/**
 * ChartsContainer contains several charts
 * the datasets are accessed by this.getDataset(iChart)
 *
 */
class ChartWidget {
    constructor(id, chartData) {
        this.id = id
        this.$div = $(this.id)
        this.$canvas = $('<canvas>')
        this.$div.append(this.$canvas)
        if (!chartData) {
            this.chartData = makeLineChartData()
        } else {
            this.chartData = chartData
        }
        this.keys = []
        this.chart = new Chart(this.$canvas, this.chartData)
    }

    getDatasets() {
        return this.chartData.data.datasets
    }

    getChartOptions() {
        return this.chartData.options
    }

    addDataset(name, xValues, yValues) {
        let datasets = this.getDatasets()
        let newDatasetData = []
        if (xValues && yValues) {
            for (let i = 0; i < xValues.length; i += 1) {
                newDatasetData.push({
                    x: xValues[i],
                    y: yValues[i],
                })
            }
        }
        let iDataset = datasets.length
        let newDataset = {
            label: name,
            data: newDatasetData,
            fill: false,
            backgroundColor: getColor(iDataset),
            borderColor: getColor(iDataset),
            showLine: true,
            pointRadius: 0,
            borderWidth: 2,
        }
        datasets.push(newDataset)
        this.keys.push(name)
        this.chart.update()
        return iDataset
    }

    updateDataset(key, xValues, yValues) {
        let data = []
        for (let i = 0; i < xValues.length; i += 1) {
            data.push({
                x: xValues[i],
                y: yValues[i],
            })
        }
        let iDataset = this.keys.indexOf(key)
        let dataset = this.getDatasets()[iDataset]
        dataset.data = data
        this.chart.update()
    }

    setTitle(title) {
        let options = this.getChartOptions()
        options.title.text = title
    }

    setXLabel(xLabel) {
        let options = this.getChartOptions()
        options.scales.xAxes[0].scaleLabel.labelString = xLabel
    }

    setYLabel(yLabel) {
        let options = this.getChartOptions()
        options.scales.yAxes[0].scaleLabel.labelString = yLabel
    }
}

class ChartsContainer {
    constructor(divId) {
        this.chartWidgets = {}
        this.$div = $(`#${divId}`).empty()
    }

    addChart(chart) {
        if (_.has(chart, 'markdown')) {
            this.$div.append(
                $('<div>').addClass('narrow-column').append(
                    md.render(chart.markdown)
                )
            )
        }
        this.$div.append(
            $('<div>')
                .attr('id', chart.id)
                .addClass('chart')
        )
        let chartWidget = new ChartWidget(`#${chart.id}`)
        if (_.has(chart, 'title')) {
            chartWidget.setTitle(chart.title)
        }
        if (_.has(chart, 'xlabel')) {
            chartWidget.setXLabel(chart.xlabel)
        }
        if (_.has(chart, 'ylabel')) {
            chartWidget.setYLabel(chart.ylabel)
        }
        if (_.has(chart, 'keys')) {
            for (let key of chart.keys) {
                chartWidget.addDataset(key)
            }
        }
        this.chartWidgets[chart.id] = chartWidget
    }

    updateChart(id, key, x, y) {
        this.chartWidgets[id].updateDataset(key, x, y)
    }
}

export { ChartsContainer }
