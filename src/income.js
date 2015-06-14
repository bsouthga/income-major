
import textures from "textures";
import curlyBrace from "./curlyBrace.js";
import d3 from 'd3';
import _ from 'lodash';

let variableHeight = false;
let sortCat = 'mean';

export default class incomeChart {

  constructor({data, id}) {
    this.data = data;
    this.id = id;
    this.container = d3.select(id);
    this.svg = this.container.append('svg');
  }

  draw() {

    let sorter = (a, b) => {
      let x = a[sortCat];
      let y = b[sortCat];
      return (x > y) - (x < y);
    };

    let color = d3.scale.category10();

    let income = this.data.map(x => {
      return {
        ...x,
        mean: Number(x.mean),
        n: Number(x.n),
        stdev: Number(x.stdev),
        category: x.category.trim()
      };
    }).sort(sorter)

    let categories = Array.from(new Set(income.map(x => x.category)));

    let bb = this.container.node().getBoundingClientRect();

    let margin = { top: 0, right: 50, bottom: 50, left: 320 },
        width = bb.width - margin.left - margin.right,
        height = bb.height - margin.top - margin.bottom;

    let totalN = income.reduce((s, d) => s + d.n, 0);

    let fixedBarHeight = height/(income.length);

    let variableBarHeight = d => {
      return variableHeight ? (d.n/totalN)*height : fixedBarHeight;
    };


    let variableBarPad = i => {
      if (!variableHeight) {
        return i*fixedBarHeight;
      }
      let pad = 0;
      while(i--) {
        pad += variableBarHeight(income[i]);
      }
      return pad;
    }

    let x = d3.scale.linear()
      .range([0, width])
      .domain([0, d3.max(income, d => d.mean + d.stdev)]);


    let xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    let svg = this.svg.html('')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    let textureGen = categories.reduce((out, c) => {
      let texture = textures.lines()
        .orientation("vertical", "horizontal")
        .size(4)
        .strokeWidth(1)
        .shapeRendering("crispEdges")
        .stroke(color(c));
      svg.call(texture);
      out[c] = texture;
      return out;
    }, {})

    let bar = svg.append('g').selectAll("g")
        .data(income)
      .enter().append("g")
        .classed('bar-g', true)
        .attr("transform", (d, i) => `translate(0,${variableBarPad(i)})` );

    bar.append('text')
      .text(d => d.subject)
      .attr('y', function(d) {
        let {height} = this.getBBox();
        return variableBarHeight(d)/2 + height/2;
      })
      .attr('x', function() {
        let {width} = this.getBBox();
        return -width - 20;
      })

    let rects = bar.append("rect")
        .attr('x', d => x(d.mean) - x(d.stdev) )
        .attr("width", d => 2*x(d.stdev) )
        .attr("height", d => variableBarHeight(d))
        .attr('fill', '#fff')
        .attr('stroke', d => color(d.category) );

    bar.append('line')
      .attr({
        stroke: d => color(d.category),
        x1 : d => x(d.mean),
        x2 : d => x(d.mean),
        y1 : 0,
        y2 : variableBarHeight
      })

    rects.on('mouseover', function() {
      d3.select(this).attr('fill', d => color(d.category));
    }).on('mouseout', function() {
      d3.select(this).attr('fill', '#fff')
    })


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)


    d3.select('#sort').on('click', () => {
      sortCat = sortCat === 'subject' ? 'mean' : 'subject';
      income.sort(sorter)
      bar.sort(sorter)
        .transition()
        .duration(1000)
        .delay((d, i) => i*10)
        .attr("transform", (d, i) => `translate(0,${variableBarPad(i)})` );
    })

    d3.select('#toggle').on('click', () => {

      variableHeight = !variableHeight;

      let trans = bar.transition()
          .duration(1000)
          .delay((d, i) => i*10)
          .attr("transform", (d, i) => `translate(0,${variableBarPad(i)})` )

      trans.selectAll('rect')
          .attr('height', d => variableBarHeight(d));

      trans.selectAll('line')
          .attr({
            y1 : 0,
            y2 : variableBarHeight
          });

      trans.selectAll('text')
        .attr('y', function(d) {
          let {height} = this.getBBox();
          return variableBarHeight(d)/2 + height/2;
        });

    });
  }




}
