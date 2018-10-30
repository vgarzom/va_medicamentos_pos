const vis_container = d3.select("#vis-container");
const vis_header = d3.select("#vis-header");

const
    margin = { top: 20, right: 50, bottom: 40, left: 70 },
    chart_width = vis_container.node().getBoundingClientRect().width;
var
    chart_height = vis_container.node().getBoundingClientRect().height - vis_header.node().getBoundingClientRect().height,
    svg = vis_container.append('svg').attr("width", chart_width).attr("height", 4000);

svg.style("font", "10px sans-serif")
    .style("width", "100%")
    .style("height", "auto");

var minMagnitude = 3;
var maxMagnitude = 8;
var minDepth = 0;
var maxDepth = 20;

var total_count = 0;

const date_parse = d3.timeParse("%Y-%m-%d");
var medicamentos = {};
var firstTime = true;


updateData();

function updateData() {
    var result = [];
    /*d3.csv("assets/data/medicamentos.csv", (error, csv_data) => {
        var data = d3.nest()
            .key((d) => {
                console.log(d);
                return d.principioactivo;
            })
            .entries(csv_data);
    }).then((data) => {
        console.log(data);
    })*/
    d3.csv(
        "assets/data/medicamentos.csv",
        (d, i) => {
            d.name = d.principioactivo;
            result.push(d);
        }
    ).then(() => {
        total_count = result.length;
        var data = d3.nest()
            .key((d) => {
                return d.formafarmaceutica.split(" ")[0];
            })
            .entries(result)
            .map((g) => {
                var di = d3.nest()
                    .key((d) => {
                        return d.formafarmaceutica;
                    })
                    .entries(g.values)
                    .map((g2) => {
                        var dp = d3.nest()
                            .key((d) => {
                                return d.name;
                            })
                            .entries(g2.values)
                            .map((g3) => {

                                var m = [];
                                for (var i = 0; i < g3.values.length; i++) {
                                    var l = g3.values[i];
                                    m.push({ name: l.cantidad + " " + l.unidadmedida });
                                }

                                return {
                                    name: g3.key,
                                    children: m
                                }
                            })
                        return {
                            name: g2.key,
                            children: dp
                        }
                    })
                return {
                    name: g.key,
                    children: di
                }
            })
        data.sort((x, y) => {
            return d3.ascending(x.name, y.name);
        })

        //createTooltip(svg);
        medicamentos = { name: "POS", children: data }
        drawTreeChart(medicamentos);
    });
}

function controlsChanged() {
    minMagnitude = d3.select("#min-magnitude-input").node().value;
    maxMagnitude = d3.select("#max-magnitude-input").node().value;
    minDepth = d3.select("#min-depth-input").node().value;
    maxDepth = d3.select("#max-depth-input").node().value;
    updateData();
}