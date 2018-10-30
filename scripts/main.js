const vis_container = d3.select("#vis-container");
const vis_header = d3.select("#vis-header");

const
    margin = { top: 20, right: 50, bottom: 40, left: 70 },
    width = vis_container.node().getBoundingClientRect().width;
var
    chart_height = vis_container.node().getBoundingClientRect().height - vis_header.node().getBoundingClientRect().height,
    svg = vis_container.append('svg').attr("width", width).attr("height", 4000),
    divideby = 5,
    dy = width / divideby;

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


function distributeByForma() {
    var result = [];
    d3.csv(
        "assets/data/medicamentos.csv",
        (d, i) => {
            d.name = d.principioactivo;
            result.push(d);
        }
    ).then(() => {
        total_count = result.length;
        var total_formas = 0;
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
                total_formas += di.length;
                return {
                    name: g.key + "(" + di.length + ")",
                    children: di
                }
            })
        data.sort((x, y) => {
            return d3.ascending(x.name, y.name);
        })

        //createTooltip(svg);
        medicamentos = { name: "POS: " + total_formas + " ff", children: data }
        drawTreeChart(medicamentos);
    });
}

function distributeByPrincipioactivo() {
    var result = [];
    d3.csv(
        "assets/data/medicamentos.csv",
        (d, i) => {
            d.name = d.cantidad + " " + d.unidadmedida + " " + d.unidadreferencia;
            result.push(d);
        }
    ).then(() => {
        var total_principios_activos = 0;
        total_count = result.length;
        result.sort((x, y) => {
            return d3.ascending(x.principioactivo, y.principioactivo);
        })

        var data = d3.nest()
            .key((d) => {
                return d.principioactivo.charAt(0);
            })
            .entries(result)
            .map((g) => {

                var dataPrincipio = d3.nest()
                    .key((d) => {
                        return d.principioactivo;
                    })
                    .entries(g.values)
                    .map((gp) => {
                        var dataForma = d3.nest()
                            .key((d) => {
                                return d.formafarmaceutica;
                            })
                            .entries(gp.values)
                            .map((gforma) => {
                                return {
                                    name: gforma.key,
                                    children: gforma.values
                                }
                            })
                        return {
                            name: gp.key,
                            children: dataForma
                        }
                    });
                total_principios_activos += dataPrincipio.length;
                return {
                    name: g.key + "(" + dataPrincipio.length + ")",
                    children: dataPrincipio
                }
            });

        //createTooltip(svg);
        medicamentos = { name: "POS: \n" + total_principios_activos + " pa", children: data }
        console.log(data);
        drawTreeChart(medicamentos);
    });
}

function controlsChanged() {
    d3.selectAll("input[name='radio-distribution']").on("change", function () {
        if (this.value === 'principioactivo') {
            svg.selectAll('g').remove();
            distributeByPrincipioactivo()
        } else {
            svg.selectAll('g').remove();
            distributeByForma();
        }
    });
    distributeByPrincipioactivo();
}

controlsChanged();