import React, { useState, useEffect } from "react";
import _mergeWith from "lodash/mergeWith";

import { useTheme, useMediaQuery } from "@material-ui/core";

import WizardDialog from "../WizardDialog";
import Step1Columns from "./Step1Columns";
import Step2NewColumns from "./Step2NewColumns";

import { ColumnConfig } from "hooks/useFiretable/useTableConfig";
import { useFiretableContext } from "contexts/firetableContext";

export type CsvConfig = {
  pairs: { csvKey: string; columnKey: string }[];
  newColumns: ColumnConfig[];
};

export interface IStepProps {
  csvData: NonNullable<IImportCsvWizardProps["csvData"]>;
  config: CsvConfig;
  setConfig: React.Dispatch<React.SetStateAction<CsvConfig>>;
  updateConfig: (value: Partial<ColumnConfig>) => void;
  isXs: boolean;
}

export interface IImportCsvWizardProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  csvData: {
    columns: string[];
    rows: string[][];
  } | null;
}

export default function ImportCsvWizard({
  open,
  setOpen,
  csvData,
}: IImportCsvWizardProps) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));

  const { tableState, tableActions } = useFiretableContext();

  const [config, setConfig] = useState<CsvConfig>({
    pairs: [
      { csvKey: "Show On Fusion", columnKey: "fusionSection" },
      { csvKey: "Datastudio Link", columnKey: "twentyTwenty" },
    ],
    newColumns: [
      {
        name: "twenty twenty",
        fieldName: "twentyTwenty",
        key: "twentyTwenty",
        type: "",
        index: -1,
      } as any,
    ],
  });
  console.log(config);
  const updateConfig: IStepProps["updateConfig"] = (value) => {
    setConfig((prev) => ({
      ..._mergeWith(prev, value, (objValue, srcValue) =>
        Array.isArray(objValue) ? objValue.concat(srcValue) : undefined
      ),
    }));
  };

  useEffect(() => {
    if (!tableState || !open) return;

    if (Array.isArray(tableState.filters) && tableState.filters?.length > 0)
      tableActions!.table.filter([]);

    if (Array.isArray(tableState.orderBy) && tableState.orderBy?.length > 0)
      tableActions!.table.orderBy([]);
  }, [open, tableState]);

  if (tableState?.rows.length === 0) return null;

  const handleFinish = () => {
    tableActions?.table.updateConfig("columns", config);
    setOpen(false);
  };

  if (!csvData) return null;

  return (
    <WizardDialog
      open={open}
      onClose={() => setOpen(false)}
      title="Import CSV"
      steps={
        [
          {
            title: "choose columns",
            description:
              "Select or add the columns to be imported to your table.",
            content: (
              <Step1Columns
                csvData={csvData}
                config={config}
                setConfig={setConfig}
                updateConfig={updateConfig}
                isXs={isXs}
              />
            ),
            disableNext: config.pairs.length === 0,
          },
          config.newColumns.length > 0 && {
            title: "set column types",
            description:
              "Set the type of each column to display your data correctly. Some column types have been suggested based off your data.",
            content: (
              <Step2NewColumns
                csvData={csvData}
                config={config}
                setConfig={setConfig}
                updateConfig={updateConfig}
                isXs={isXs}
              />
            ),
            disableNext: config.newColumns.reduce(
              (a, c) => a || (c.type as any) === "",
              false
            ),
          },
          {
            title: "preview",
            description:
              "Preview your data with your configured columns. You can change column types by clicking “Edit Type” from the column menu at any time.",
            content: <div>Step4Preview</div>,
          },
        ].filter((x) => x) as any
      }
      onFinish={handleFinish}
    />
  );
}
