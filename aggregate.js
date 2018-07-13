/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');

const aggregate = (filePath) => {
  // readfile functions with Promise. readfile1 and readfile2 recieve filepaths
  // and fs.readFile reads the file. On successful reading, resolve returns result. In case of
  // failure, reject returns error.
  const readfile1 = filepath1 => new Promise((resolve, reject) => {
    fs.readFile(filepath1, 'utf8', (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
  const readfile2 = filepath2 => new Promise((resolve, reject) => {
    fs.readFile(filepath2, 'utf8', (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });

  // If files passed to readfile1 and readfile2 are read successfully, function inside .then
  // performed. Data read from two files is returned as an array (values) with values[0]
  // containing 1st file data and values[1] containing 2nd file data.
  Promise.all([readfile1(filePath), readfile2('./data/ccmap.txt')])
    .then((values) => {
      // Creating 2 arrays to store data split by \n
      let dataarr = [];
      let contdataarr = [];

      // Take respective row from values array, split them by \n and store in respective arrays
      // dataarr and contdataarr resp.
      dataarr = values[0].replace(/"/g, '').split('\n');
      contdataarr = values[1].split('\n');

      // Creatin 2 arrays to store data split by ,
      const array1 = [];
      const array2 = [];

      // Split each row of dataarr and contdataarr by , and store in array1 and array2 resp.
      // array1 and array2 are 2D.
      for (let i = 1; i < dataarr.length - 1; i += 1) {
        array1.push(dataarr[i].split(','));
      }
      for (let i = 0; i < contdataarr.length - 1; i += 1) {
        array2.push(contdataarr[i].split(','));
      }
      // console.log(array1[0][0]); ===> Argentia
      // console.log(array1[0][1]); ===> Area of Argentina
      // console.log(array2[0][1]); ===> Algeria (Column1 = Country)
      // console.log(array2[0][1]); ===> Africa (Column2 = Continent)

      // Convert array to Map. Country => Continent
      const contdatamap = new Map(array2);

      // Create arrays to store filtered data: Population and GDP of 2012
      const populationarray = [];
      const gdparray = [];

      // Filtering array1 to get only Population of 2012
      for (let i = 0; i < array1.length - 1; i += 1) {
        populationarray.push([array1[i][0], array1[i][4]]);
      }
      // console.log(populationarray[0][0]); Argentina
      // console.log(populationarray[0][1]); Population of Argentina

      // Filtering array1 to get only GDP of 2012
      for (let i = 0; i < array1.length - 1; i += 1) {
        gdparray.push([array1[i][0], array1[i][7]]);
      }
      // console.log(gdparray[0][0]); Argentina
      // console.log(gdparray[0][1]); GDP of Argentina

      // Convert filtered arrays to maps.
      // popmap : Country => Population of 2012
      // gdpmap : Country => GDP of 2012
      const popmap = new Map(populationarray);
      const gdpmap = new Map(gdparray);

      // Create map to store Continent => Aggregate GDP
      const gdp = new Map();
      // Create map to store Continent => Aggregate Population
      const pop = new Map();

      // For each continent(value) of contdatamap, if gdp has continent and gdpmap
      // has country(key) then set key and value of gdp as sum of gdp and continent
      // respectively (similarly for pop) else if gdpmap has country set key and value
      // of gdp as gdp for that country and continent repectivelty.
      contdatamap.forEach((value, key) => {
        if (gdp.has(value) && gdpmap.has(key)) {
          gdp.set(value, parseFloat(gdp.get(value)) + parseFloat(gdpmap.get(key)));
          pop.set(value, parseFloat(pop.get(value)) + parseFloat(popmap.get(key)));
        } else if (gdpmap.has(key)) {
          gdp.set(value, parseFloat(gdpmap.get(key)));
          pop.set(value, parseFloat(popmap.get(key)));
        }
      });

      // outputstring to store output in required format
      const outputstring = {};
      gdp.forEach((value, key) => {
        outputstring[key] = {
          GDP_2012: value,
          POPULATION_2012: pop.get(key),
        };
      });

      // convert outputstring to JSON and write into output file
      const writefile = filepath3 => new Promise((resolve, reject) => {
        fs.writeFile(filepath3, JSON.stringify(outputstring), (err, result2) => {
          if (err) reject(err);
          else resolve(result2);
        });
      });
      writefile('./output/output.json').then(result2 => console.log(result2));
    })
    .catch(errors => console.log(errors));
};

module.exports = aggregate;
