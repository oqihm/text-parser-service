const express = require('express');
const bodyParser = require('body-parser');
const parser = require('./grammar'); // Import the generated parser
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes

// Middleware to parse JSON request bodies
app.use(bodyParser.text({ type: '*/*' }));

// Endpoint to parse the input text
app.post('/parse', (req, res) => {
  try {
    const input = req.body;
    const result = parser.parse(input);

    // Helper function to clean up nested arrays
    const cleanUpNestedArrays = (arr) => {
      return arr.map(item => {
        if (Array.isArray(item)) {
          return cleanUpNestedArrays(item).filter(subItem => !(Array.isArray(subItem) && subItem.length === 0));
        }
        return item;
      }).flat();
    };

    // Clean up the parsed result
    const cleanedResult = cleanUpNestedArrays(result.categories);

    // Filter out categories that are not of type 'fields'
    const filteredResult = cleanedResult.filter(category => category.type === 'Fields' || category.type === 'Calculations');

    const retunValue = removeEmptyItems(filteredResult);

    res.json({ categories: retunValue });
    //console.log({ categories: filteredResult });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

function removeEmptyItems(item) {
  if (Array.isArray(item)) {
    return item
      .map(removeEmptyItems) // Recursively process each item
      .flat(Infinity) // Flatten nested arrays
      .filter(el => el !== null && el !== undefined && el !== "" && el !== "\n" && el !== "\t");
  }

  if (typeof item === "object" && item !== null) {
    if (item.list) {
      // Clean and filter List items
      item.list = clean(item.list);
    }

    if(item.calculations) {
      item.calculations = clean(item.calculations);
    }

    // Process object properties
    const cleanedObject = {};
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        const value = removeEmptyItems(item[key]);
        if (value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0)) {
          cleanedObject[key] = value;
        }
      }
    }
    return Object.keys(cleanedObject).length > 0 ? cleanedObject : null;
  }

  return item;
}

function clean(col) {
  if (!Array.isArray(col)) {
    return []; // Return empty if not an array
  }

  // Flatten nested arrays and filter out invalid items
  const flattened = col.flat(Infinity).filter(item => {
    // Check if item is an object with name and value
    return item && typeof item === 'object' && item.name && item.value;
  });

  return flattened;
}