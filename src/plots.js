import d3 from "d3";

const print = console.log.bind(console);

/*
 * csv promise function
 */
const csv = fname => new Promise((resolve, reject) => {
  d3.csv(fname, (e, data) => e ? reject(e) : resolve(data))
});

/*
 * Main rendering function
 */
export function render() {

  let data = [
    '../data/major_by_income.csv',
    '../data/relative_percent.csv'
  ].map(csv);

  Promise.all(data)
    .then(data => {
      let [income, percent] = data;
      print("data", income);
    })
    .catch(print);

}
