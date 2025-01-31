import {
  getDateRange
} from "./parsing.js";
import chalk from "chalk";

function testGetDateRange() {
  let dates = getDateRange(-2, 1);
  console.log(chalk.bold("getDateRange(-2, 1)"));
  console.log(dates);
}

testGetDateRange();
