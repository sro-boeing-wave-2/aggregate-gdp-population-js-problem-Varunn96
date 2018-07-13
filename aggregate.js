/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');
const promise = require('promise');

const aggregate = (filePath) => {
  let dataarr = [];
  let contdataarr = [];

  const readfile1 = filepath => new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  promise.all(readfile1(filePath), readfile1('./data/ccmap.txt')).then((values) => {
    dataarr = values[0].toString().replace(/"/g, '').split('\n');
    contdataarr = values[1].toString().split('\n');
    const array1 = [];
    const array2 = [];

    for (let i = 1; i < dataarr.length - 1; i += 1) {
      array1.push(dataarr[i].split(','));
    }
    for (let i = 0; i < contdataarr.length - 1; i += 1) {
      array2.push(contdataarr[i].split(','));
    }
    const contdatamap = new Map(array2);

    const populationarray = [];
    const gdparray = [];
    for (let i = 0; i < array1.length - 1; i += 1) {
      populationarray.push([array1[i][0], array1[i][4]]);
    }
    for (let i = 0; i < array1.length - 1; i += 1) {
      gdparray.push([array1[i][0], array1[i][7]]);
    }

    const popmap = new Map(populationarray);
    const gdpmap = new Map(gdparray);

    const gdp = new Map();
    const pop = new Map();

    contdatamap.forEach((value, key) => {
      if (gdp.has(value) && gdpmap.has(key)) {
        gdp.set(value, parseFloat(gdp.get(value)) + parseFloat(gdpmap.get(key)));
        pop.set(value, parseFloat(pop.get(value)) + parseFloat(popmap.get(key)));
      } else if (gdpmap.has(key)) {
        gdp.set(value, parseFloat(gdpmap.get(key)));
        pop.set(value, parseFloat(popmap.get(key)));
      }
    });
    const out = './output/output.json';
    const outstring = {};
    gdp.forEach((value, key) => {
      outstring[key] = {
        GDP_2012: value,
        POPULATION_2012: pop.get(key),
      };
    });
    fs.writeFileSync(out, JSON.stringify(outstring));
  });
};

module.exports = aggregate;
