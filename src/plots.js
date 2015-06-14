import _ from 'lodash';
import incomeChart from './income.js';


/*
 * csv promise function
 */
const csv = fname => new Promise((resolve, reject) => {
  d3.csv(fname, (e, data) => e ? reject(e) : resolve(data))
});


/*
 * Main rendering function
 */
export default async function render() {

  let data = await* [
    '../data/major_by_income.csv',
    '../data/relative_percent.csv',
  ].map(csv);

  let [income, percent, expected] = data;

  let plots = [
    new incomeChart({data : income, id : '#chart'})
  ];

  let draw = x => x.draw();

  plots.map(draw)

  window.addEventListener('resize', _.debounce(() => {plots.map(draw)}, 50))

}
