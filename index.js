const axios = require('axios')
const dotenv = require('dotenv')
const { program } = require('commander')
const uuid = require('uuid')
const inquirer = require('inquirer')

dotenv.config()

const generateQueryParameters = (params) => {
  let retString = "?useColumnNames=true";
  for (let param in params) {
    retString += '&' + param + '=' + params[param]
    if (param !== Object.keys(params)[Object.keys(params).length - 1]) {
      retString += '&'
    }
  }
  return retString
}

const CodaClient = () => {
  const apiKey = process.env.CODA_ACCESS_KEY
  const rootUrl = 'https://coda.io/apis/v1'
  const doc = 'A82sLqephK'
  const config = {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }
  }
  let uri = `${rootUrl}/docs/${doc}`
  return {

    whoami: async function() {
      try {
        let result = await axios.get(uri, config)
        return result.data
      } catch (err) {
        console.debug(err)
      }
    },

    getFromHref: async function(href) {
      try {
        let result = await axios.get(href, config)
        return result.data
      } catch(err) {
        return err?.response.data
      }
    },

    addRows: async function(tableIdorName, rows) {
      try {
        let result = await axios.post(uri + `/tables/${tableIdorName}/rows`, rows, config)
        return result.data
      } catch (err) {
        return err?.response?.data
      }
    },

    deleteRows: async function(tableIdorName, rowIds) {
      try {
        let result = await axios.delete(uri + `/tables/${tableIdorName}/rows`, rowIds, config)
        return result.data
      } catch (err) {
        return err?.response?.data
      }
    },

    updateRow: async function(tableIdorName, rowId, updatedValue) {
      try {
        let result = await axios.put(uri + `/tables/${tableIdorName}/rows/${rowId}`, updatedValue, config)
        return result.data
      } catch (err) {
        return err?.response?.data
      }
    },

    getRow: async function(tableIdorName, rowId) {
      try {
        let row = await axios.get(uri + `/tables/${tableIdorName}/rows/${rowId}`, config)
        return row.data
      } catch (err) {
        return err?.response?.data
      }
    },

    getTable: async function(tableIdorName, queryParams) {
      try {
        let table = await axios.get(uri + `/tables/${tableIdorName}${generateQueryParameters(queryParams)}`, config)
        return table.data
      } catch (err) {
        return err?.response?.data
      }
    },

    getTables: async function() {
      try {
        let tables = await axios.get(uri + `/tables`, config)
        return tables.data
      } catch (err) {
        return err?.response?.data
      }
    },

    getRows: async function(tableIdorName, queryParams) {
      try {
        let rows = await axios.get(uri + `/tables/${tableIdorName}/rows${generateQueryParameters(queryParams)}`, config)
        return rows.data
      } catch (err) {
        return err?.response?.data
      }
    },

    getColumns: async function(tableIdorName, queryParams) {
      try {
        let columns = await axios.get(uri + `/tables/${tableIdorName}/columns${generateQueryParameters(queryParams)}`, config)
        return columns.data
      } catch (err) {
        return err?.response?.data
      }
    },

    getColumn: async function(tableIdorName, columnIdorName, queryParams) {
      try {
        let column = await axios.get(uri + `/tables/${tableIdorName}/columns/${columnIdorName}${generateQueryParameters(queryParams)}`, config)
        return column.data
      } catch (err) {
        return err?.response?.data
      }
    }
  }
}

const cc = CodaClient()

const Column = (name, value) => {
  return {
    column: name,
    value: value,
  }
}

const Rows = (rows) => {
  return {
    rows: [
      ...rows
    ]
  }
}

const Row = (columns) => {
  return {
    cells: [
      ...columns,
      {
        column: '_Hash',
        value: uuid.v4(),
      }
    ]
  }
}

const stringContains = (haystack, needle) => {
  const re = new RegExp(`${needle}`, 'gi')
  const match = re.exec(haystack)
  if (match) return true
  return false
}

const findMatchesInArray = (haystack, searchProp, needle) => {
  let matches = [];
  for (let obj of haystack) {
    let re = new RegExp(`${needle}`, 'gi')
    if (re.exec(obj['values'][searchProp])) matches.push(obj)
  }
  return matches
}

const capitalizeFirstLetter = (str) => {
  return str.at(0).toUpperCase() + str.substr(1, str.length)
}

module.exports = () => {
  program
    .name('coda')
    .description('CLI tool for retrieving coda data')
    .version('0.1.0')

  program
    .command('list')
    .description('lists rows from the selected table')
    .argument('<table>', 'table to list from')
    .option('-l, --limit <number>', 'limit the amound of rows returned')
    .alias('lp')
    .action(async (table, options) => {
      let params = {}
      if (options?.limit) params.limit = options.limit
      let results = await cc.getRows(capitalizeFirstLetter(table), params)
      for (let project of results.items) {
        console.log(project.name)
      }
    })

  program
    .command('list-tables')
    .description('list all tables')
    .action(async () => {
      let response = await cc.getTables()
      for (let table of response.items) {
        console.log(table.name)
      }
    })

  program
    .command('list-columns')
    .description('lists out the columns on a given table')
    .option('-l, --limit', 'limit the amount of columns in the response')
    .argument('<table>', 'the id or name of the table')
    .action(async (table, limit) => {
      let params = {}
      if (limit) params.limit = limit
      let response = await cc.getColumns(capitalizeFirstLetter(table))
      console.log(response)
    })

  program
    .command('list-entities')
    .description('list all entities')
    .option('-l, --limit', 'limit the number of returned rows')
    .action(async (limit) => {
      let params = {}
      if (limit) params.limit = limit
      let entities = await cc.getRows('Entities', params)
      for (let entity of entities.items) {
        console.log(entity.values['Name'])
      }
    })

  program
    .command('create-entity')
    .description('create a new entity')
    .argument('<entityName>')
    .argument('[type]', 'optional. type of the entity')
    .action(async (name) => {
      let response = await cc.addRows('Entities', Rows([Row([Column('Name', name)])]))
      console.log(response)
    })

  program
    .command('create-building')
    .description('create a new building and entity')
    .argument('<name>', 'name of the building')
    .action(async (name) => {
      let newEntity = await cc.addRows('Entities', Rows([Row([Column('Name', name), Column('Type', 'Building')])]))
      let newBuilding = await cc.addRows('Buildings', Rows([Row([Column('Entity', name)])]))
      console.log('entity: ', newEntity)
      console.log('building', newBuilding)
    })

  program
    .command('create-project')
    .description('create a new project on a building entity')
    .argument('<project title>')
    .argument('[building name]', 'optional, if you know the name of the building entity')
    .action(async (project, building) => {

      let allBuildings = await cc.getRows('Buildings')
      if (building) {
        let matchedBuildings = findMatchesInArray(allBuildings.items, 'Entity', building) 
        if (!matchedBuildings.length) {

          inquirer.prompt([{
            name: 'building',
            message: 'There were no valid matches to your building name, please choose from the list of all buildings, or re-initiate the command',
            choices: allBuildings.items.map(x => x.name),
            type: 'list',
          }])
            .then(async (answers) => {
             cc.addRows('Projects', Rows([Row([Column('Title', project), Column('Building', answers.building)])]))
              .then(res => console.log(res))   
            })

        } else if (matchedBuildings.length > 1) {

          inquirer.prompt([{
            type: 'list',
            message: 'There were multiple matches to the provided building name, which would you like to choose?',
            choices: matchedBuildings.map(x => x.name),
            name: 'building',
          }]) 
            .then(async (answers) => {
              let response = await cc.addRows('Projects', Rows([Row([Column('Title', project), Column('Building', answers.building)])]))
              console.log(response)
            })

        } else  {

          let response = await cc.addRows('Projects', Rows([Row([Column('Title', project), Column('Building', matchedBuildings[0].name)])]))
          console.log(response)

        }

      } else {

        inquirer.prompt([{
          type: 'list',
          message: 'Which building would you like to add the project to?',
          choices: allBuildings.items.map(x => x.name),
          name: 'building',
        }]).then(async (answers) => {
          let response = await cc.addRows('Projects', Rows([Row([Column('Title', project), Column('Building', answers.building)])]))
          console.log(response)
        })
      }
    })

  program
    .command('get-column')
    .description('get a specific column of a given table')
    .argument('<table>', 'table name')
    .argument('<column>', 'the column name')
    .action(async (table, column) => {
      let response = await cc.getColumn(capitalizeFirstLetter(table), capitalizeFirstLetter(column))
      console.log(response)
    })

  program
    .command('whoami')
    .description('returns the coda user associated with the access key you have')
    .action(async () => {
      let response = await cc.whoami()
      console.log(response)
    })

  program
    .command('fill-hashes')
    .description('fill rows without a _Hash with a valid uuid hash,\n default tables include:\n  - Buildings\n  - Projects\n  - Jobs\n  - Signs\n  - Sign Types\n  - Sign Layers')
    .option('-t, --tables <tables...>', 'list of tables to check')
    .action(async (options) => {
      if (options?.tables) {
        for (let table of options.tables) {
          let updatedRows = 0
          let tableName = capitalizeFirstLetter(table)
          for (let row of (await cc.getRows(tableName)).items) {
            if (row.values['_Hash'] === '') {
              await cc.updateRow(tableName, row.name, { row: Row([Column('_Hash', uuid.v4())]) })
              updatedRows++
            }
          }
          console.log(`table ${tableName}, updated ${updatedRows} rows`)
        }
      } else {
        let defaultTables = [
          'Buildings',
          'Projects',
          'Jobs',
          'Signs',
          'Sign Types',
          'Layers',
        ]
        for (let table of defaultTables) {
          let updatedRows = 0
          for (let row of (await cc.getRows(table)).items) {
            if (row.values['_Hash'] === '') {
              await cc.updateRow(table, row.id, { row: Row([Column('_Hash', uuid.v4())]) })
              updatedRows++
            }
          }
          console.log(`table: ${table}, updated: ${updatedRows} rows`)
        }
      }
    })

  program
    .command('test-update')
    .action(async () => {
      let response = await cc.updateRow('Testing', 'Test 2', {row: Row([Column('Cost', 38.23)])})
      console.log(response)
    })

  program.parse()
}
