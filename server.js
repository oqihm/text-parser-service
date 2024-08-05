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
    console.log(input);

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

    res.json({ categories: filteredResult });
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
