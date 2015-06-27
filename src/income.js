
import tooltipFactory from "./tooltip.js";
import curlyBrace from "./curlyBrace.js";
import csv from "./csv.js";
import d3 from 'd3';
import _ from 'lodash';
import pym from 'pym.js';


let sortCat = 'subject';

let idGen = d => d.subject.toLowerCase().replace(/[\W\s]/g, "");

let tooltip = tooltipFactory();

tooltip.hide();

class incomeChart {

  constructor({data, id}) {
    this.data = data;
    this.id = id;
    this.container = d3.select(id);
    this.svg = this.container.html('').append('svg');
  }

  draw() {

    let sorter = (a, b) => {
      let x = a[sortCat];
      let y = b[sortCat];
      return (x > y) - (x < y);
    };

    let income = this.data.map(x => {
      return Object.assign(x, {
        mean: Number(x.mean),
        n: Number(x.n),
        stdev: Number(x.stdev),
        subject: x.subject.trim()
      });
    }).sort(sorter)

    let bb = this.container.node().getBoundingClientRect();

    let margin = { top: 50, right: 5, bottom: 20, left: 280 },
        width = bb.width - margin.left - margin.right,
        height = bb.height - margin.top - margin.bottom;

    let fixedBarHeight = height/(income.length);

    let BarPad = i => i*fixedBarHeight;

    let x = d3.scale.linear()
      .range([0, width])
      .domain([0, d3.max(income, d => d.mean + d.stdev)]);

    let xAxis = d3.svg.axis()
        .scale(x)
        .ticks(5)
        .tickFormat(d3.format('$,'))
        .orient("bottom");

    let svg = this.svg.html('')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);


    let bar = svg.append('g').selectAll("g")
        .data(income)
      .enter().append("g")
        .classed('bar-g', true)
        .attr("transform", (d, i) => `translate(0,${BarPad(i)})` );

    bar.append('text')
      .text(d => d.subject)
      .attr('class', idGen)
      .attr('y', function(d) {
        let {height} = this.getBBox();
        return fixedBarHeight/2 + height/2;
      })
      .attr('x', function() {
        let {width} = this.getBBox();
        return -width - 20;
      })

    let curly = svg.append('g')
      .append('path')
      .attr('class', 'curlyBrace')
      .attr('d', curlyBrace(
          x(income[0].mean) + x(income[0].stdev),
          -5,
          x(income[0].mean) - x(income[0].stdev),
          -5,
          20,
          0.5
        )
      )

    let curlyText = svg.append('g')
      .append('text')
      .text('Mean Parent Income +/- 1 Standard Deviation')
      .attr({
        x : function() {
          return x(income[0].mean) - this.getBBox().width/2;
        },
        y : -30
      })

    bar.append('line')
      .attr({
        class: d => 'range ' + idGen(d),
        x1 : d => x(d.mean) - x(d.stdev) ,
        x2 : d => x(d.mean) + x(d.stdev) ,
        y1 : fixedBarHeight/2 ,
        y2 : fixedBarHeight/2
      })

    bar.append('line')
      .attr({
        class: d => 'bounds ' + idGen(d),
        x1 : d => x(d.mean) - x(d.stdev) ,
        x2 : d => x(d.mean) - x(d.stdev) ,
        y1 : fixedBarHeight/3,
        y2 : fixedBarHeight*2/3
      })

    bar.append('line')
      .attr({
        class: d => 'bounds ' + idGen(d),
        x1 : d => x(d.mean) + x(d.stdev) ,
        x2 : d => x(d.mean) + x(d.stdev) ,
        y1 : fixedBarHeight/3,
        y2 : fixedBarHeight*2/3
      })


    bar.append('circle')
      .attr({
        class: d => 'mean ' + idGen(d),
        r: 4,
        cx : d => x(d.mean),
        cy : fixedBarHeight/2
      })


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    let fmt = d3.format('$,');

    bar.on('mouseover', function(d) {

      let thisBar = d3.select(this);

      thisBar.select('text').classed('highlight', true);

      tooltip
        .text({mean: fmt(d.mean), stdev: `(&plusmn;${fmt(d.stdev)})`})
        .position(thisBar.select('circle.mean').node());

    }).on('mouseout', () => {
      bar.selectAll('text').classed('highlight', false);
      tooltip.hide();
    })

    d3.select('#sort').on('click', () => {
      sortCat = sortCat === 'subject' ? 'mean' : 'subject';

      income.sort(sorter)

      bar.sort(sorter)
        .transition()
        .duration(1000)
        .delay((d, i) => i*10)
        .attr("transform", (d, i) => `translate(0,${BarPad(i)})` );

      curly
        .transition()
        .duration(1000)
        .attr('d', curlyBrace(
            x(income[0].mean) + x(income[0].stdev),
            -5,
            x(income[0].mean) - x(income[0].stdev),
            -5,
            20,
            0.5
          )
        )

      curlyText
        .transition()
        .duration(1000)
        .attr({
          x : function() {
            return x(income[0].mean) - this.getBBox().width/2;
          },
          y : -30
        })

    })

  }

}


export default async function render() {

  let income = await csv('./major_by_income.csv');

  let plot = new incomeChart({data : income, id : '#chart'});

  plot.draw()

  let renderCallback = _.debounce(::plot.draw, 50);

  new pym.Child({renderCallback});

}

