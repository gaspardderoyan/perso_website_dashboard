import chalk from "chalk";
import {
  dateToPath,
  getDateRange,
  parseMarkdown,
  parseYAML,
  getYAMLDataAsObjectFromDates,
  updateYAMLFrontmatter,
  updateAllYAMLFiles
} from "./parsing_new.js";
import  path from "path";

const testVaultPath = process.env.TEST_VAULT_PATH;
const testDate = "2025-01-28";
const testFilePath = dateToPath(testDate, testVaultPath);
const testYamlData = parseMarkdown(path.resolve(testFilePath), 'yaml');
const testParsedYaml = parseYAML(testYamlData);
const testDateRange = getDateRange(-4, 0);
const testYamlDataAsObject = getYAMLDataAsObjectFromDates(testDateRange);

function testGetDateRange() {
  let dates = getDateRange(-2, 1);
  console.log(chalk.bold.magenta("\ngetDateRange(-2, 1)"));
  console.log("\t", dates);
}

function testDateToPath() {
  console.log(chalk.bold.magenta("\ndateToPath('2024-01-31')"));
  console.log("\t", dateToPath("2024-01-31"));
  console.log(chalk.bold.magenta("\ndateToPath('2024-01-31')"));
  console.log("\t", dateToPath("2024-01-31", "/some/example/path"));
  console.log(chalk.bold.magenta("\ndateToPath('2024-01-28',testVaultPath)"));
  console.log("\t", dateToPath(testDate,testVaultPath));
}

function testParseMarkdown() {
  console.log(chalk.bold.magenta("\nparseMarkdown(testFilePath, 'yaml')"));
  console.log(parseMarkdown(path.resolve(testFilePath), 'yaml'));
  console.log(chalk.bold.magenta("\nparseMarkdown(testFilePath, 'content')"));
  console.log(parseMarkdown(path.resolve(testFilePath), 'content'));
}

function testParseYaml() {
  console.log(chalk.bold.magenta("\nparseYAML(testYamlData)"));
  console.log(parseYAML(testYamlData));
}

function testGetYAMLDataAsObjectFromDates() {
  console.log(chalk.bold.magenta("\ngetYAMLDataAsObjectFromDates(testParsedYaml)"));
  console.log(getYAMLDataAsObjectFromDates(testDateRange));
}

function testUpdateYamlFrontmatter() {
  console.log(chalk.bold.magenta("updateYAMLFrontmatter"));
  updateYAMLFrontmatter(testFilePath, testYamlDataAsObject);
}

function testUpdateAllYamlFiles() {
  console.log(chalk.bold.magenta("updateYAMLFrontmatter"));
  updateAllYAMLFiles(testYamlDataAsObject);
}

function main() {
  testGetDateRange();
  testDateToPath();
  testParseMarkdown();
  testParseYaml();
  testGetYAMLDataAsObjectFromDates();
  //testUpdateYamlFrontmatter();
  testUpdateAllYamlFiles();
}

main()
