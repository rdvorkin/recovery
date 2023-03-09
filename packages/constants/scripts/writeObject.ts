import fs from "fs";
import prettier from "prettier";

const GENERATED_HEADER =
  "// 🛑 DO NOT EDIT!!!\n// This file is automatically generated at build time.";

export const writeObject = async (
  filePath: string,
  varName: string,
  description: string,
  data: object
) => {
  const dataStr = JSON.stringify(data, null, 2);

  const configStr = `${GENERATED_HEADER}\n\n/**\n * ${description}\n */\nexport const ${varName} = ${dataStr} as const;\n`;

  const formattedConfigStr = prettier.format(configStr, {
    parser: "typescript",
  });

  await fs.promises.writeFile(filePath, formattedConfigStr);

  console.info(`Wrote ${varName} to ${filePath}`);
};