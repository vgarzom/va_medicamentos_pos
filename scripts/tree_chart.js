
var tree = data => {
    const root = d3.hierarchy(data);
    root.dx = 10;
    root.dy = chart_width / (root.height + 1);
    return d3.tree().nodeSize([root.dx, root.dy])(root);
}

function drawTreeChart(data) {
    const root = tree(data);
    console.log(root)
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });
    svg.attr("height", total_count * 18.1);
    svg.style("width", "100%")
        .style("height", "auto");

    const g = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("transform", `translate(${root.dy / 3},${root.dx - x0})`);

    const link = g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .enter().append("path")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    const node = g.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("g")
        .data(root.descendants().reverse())
        .enter().append("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
        .attr("fill", d => d.values ? "#555" : "#999")
        .attr("r", 2.5);

    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.values ? -6 : 6)
        .attr("text-anchor", d => d.values ? "end" : "start")
        .text(d => d.data.name)
        .clone(true).lower()
        .attr("stroke", "white");
}

function mouseover(d) {

    var sismo = d3.select(`#sismo_${d.id}`);
    sismo
        .attr("stroke", "black")
        .attr("stroke-width", 1.2);

    updateTooltip(d, sismo);
}
