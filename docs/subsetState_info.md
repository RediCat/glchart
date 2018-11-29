# Using `glchart.Chart.subsetState(name, value)`

## Introduction

A chart, conceptually for this explanation, is compromised of a list datasets. 
Each dataset is compromised of a list of {x, y} datapoints which also has a 
name attached to it when we create the Chart object. 

Example of glchart init:

```javascript
// create canvas which will hold the rendering context 
// at this point you can change the size into whatever you want/need
let newCanvas = document.createElement('canvas');

let chart = new glchart.Chart({
    chart: {
        element: newCanvas,
        fontColor: 0x0000ff,
        title: 'RandomData'
    },
    axis: {
        x: {
            lineColor: 0xaabbff,
            label: 'X'
        },
        y: {
            lineColor: 0x000000,
            label: 'Y'
        }
    },
    dataset: {
        unitsPerPixel: 1,
        values: [
            {
                name: 'Value 1',
                data: createLinearGraph(10000, 1456)
            },
            {
                name: 'Value 2',
                data: createPeriodicRandomData(10000, 1456)
            }
        ]
    }
});
```

### Enabling/Disabling specific values/subsets

The objects inside the array `options.dataset.values` are the different 
subsets/values that are show in the graph. Each of this objects has a name 
property which is used to refer to it when we want show/hide them.

Based on the first example, here's an example of showing hiding a subset 
based on a button press:

```javascript
$(buttonId).click(function () {
    let subsetName = 'Value 1';

    let oldValue = chart.subsetStatus(subsetName);

    if (oldValue) {
        $(this).html(`Show '${subsetName}'`);
    } else {
        $(this).html(`Hide '${subsetName}'`);
    }

    chart.subsetStatus(subsetName, !oldValue);
});
```