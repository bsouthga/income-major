import d3 from 'd3';

/*
 * csv promise function
 */
export default fname => new Promise((resolve, reject) => {
  d3.csv(fname, (e, data) => e ? reject(e) : resolve(data))
});

