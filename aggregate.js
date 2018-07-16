/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');

// readfile functions with Promise. readfile1 and readfile2 recieve filepaths
// and fs.readFile reads the file. On successful reading, resolve returns result. In case of
// failure, reject returns error.
const readfile = filepath1 => new Promise((resolve, reject) => {
  fs.readFile(filepath1, 'utf8', (error, result) => {
    if (error) reject(error);
    else resolve(result);
  });
});

// writefile function with promise. filepath2 => path of output.json.
// outputobject => object to be written
const writefile = (filepath2, outputobject) => new Promise((resolve, reject) => {
  fs.writeFile(filepath2, outputobject, (error2, result2) => {
    if (error2) reject(error2);
    else resolve(result2);
  });
});

// declare object to store final gdp and population aggregate continent wise
const populationGDPAggregate = {};
const aggregate = filePath => new Promise((resolve1, reject1) => {
  Promise.all([readfile(filePath), readfile('./data/countrytocontinentmap.json')])
    .then((values) => {
      const dataFromFile = values[0].replace(/"/g, '').split('\n');
      const mapper = JSON.parse(values[1]); // Country Continent Map in JSON Format
      const dataHeader = dataFromFile[0].split(',');
      const dataRows = dataFromFile.slice(1, dataFromFile.length - 1);
      const countryIndex = dataHeader.indexOf('Country Name');
      const Pop2012Index = dataHeader.indexOf('Population (Millions) - 2012');
      const GDP2012Index = dataHeader.indexOf('GDP Billions (US Dollar) - 2012');
      dataRows.forEach((row) => {
        const splitDataByComma = row.replace(/"/, '').split(',');
        if (populationGDPAggregate[mapper[splitDataByComma[countryIndex]]] !== undefined
          && splitDataByComma[countryIndex] !== 'European Union') {
          populationGDPAggregate[mapper[splitDataByComma[countryIndex]]].GDP_2012
          += parseFloat(splitDataByComma[GDP2012Index]);
          populationGDPAggregate[mapper[splitDataByComma[countryIndex]]].POPULATION_2012
          += parseFloat(splitDataByComma[Pop2012Index]);
        } else if (splitDataByComma[countryIndex] !== 'European Union') {
          populationGDPAggregate[mapper[splitDataByComma[countryIndex]]] = {
            GDP_2012: parseFloat(splitDataByComma[GDP2012Index]),
            POPULATION_2012: parseFloat(splitDataByComma[Pop2012Index]),
          };
        }
      });
      writefile('./output/output.json', JSON.stringify(populationGDPAggregate, 2, 2))
        .then(result2 => resolve1(result2), error2 => reject1(error2));
    });
});

module.exports = aggregate;
