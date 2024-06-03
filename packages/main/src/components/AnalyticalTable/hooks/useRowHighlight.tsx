import { IndicationColor, ValueState } from '../../../enums/index.js';
import type { ReactTableHooks } from '../types/index.js';

const baseStyles = {
  width: '100%',
  height: '100%'
};

const HighlightColors = {
  ...ValueState,
  ...IndicationColor,
  None: undefined
};

/*
 * COMPONENTS
 */
const Header = () => <div style={{ width: '6px' }} />;

const Cell = (instance) => {
  const { cell, webComponentsReactProperties } = instance;
  const styleClass = HighlightColors[cell?.value]
    ? webComponentsReactProperties.classes[HighlightColors[cell.value].toLowerCase()]
    : undefined;
  return <div style={baseStyles} className={styleClass} data-component-name="AnalyticalTableHighlightCell" />;
};

/*
 * TABLE HOOKS
 */
const columnsDeps = (deps, { instance: { webComponentsReactProperties } }) => {
  return [...deps, webComponentsReactProperties.withRowHighlight, webComponentsReactProperties.highlightField];
};
const visibleColumnsDeps = (deps, { instance }) => [...deps, instance.webComponentsReactProperties.withRowHighlight];
const visibleColumns = (currentVisibleColumns, { instance: { webComponentsReactProperties } }) => {
  if (!webComponentsReactProperties.withRowHighlight) {
    return currentVisibleColumns.filter(({ id }) => id !== '__ui5wcr__internal_highlight_column');
  }

  const highlightColumn = currentVisibleColumns.find(({ id }) => id === '__ui5wcr__internal_highlight_column');
  return [highlightColumn, ...currentVisibleColumns.filter(({ id }) => id !== '__ui5wcr__internal_highlight_column')];
};

const columns = (currentColumns, { instance }) => {
  const { withRowHighlight, highlightField } = instance.webComponentsReactProperties;

  if (!withRowHighlight) {
    return currentColumns;
  }
  return [
    {
      id: '__ui5wcr__internal_highlight_column',
      accessor: highlightField,
      disableFilters: true,
      disableSortBy: true,
      disableGroupBy: true,
      disableResizing: true,
      disableDragAndDrop: true,
      width: 6,
      minWidth: 6,
      maxWidth: 6,
      Header,
      Cell
    },
    ...currentColumns
  ];
};

export const useRowHighlight = (hooks: ReactTableHooks) => {
  hooks.columns.push(columns);
  hooks.columnsDeps.push(columnsDeps);
  hooks.visibleColumnsDeps.push(visibleColumnsDeps);
  hooks.visibleColumns.push(visibleColumns);
};

useRowHighlight.pluginName = 'useRowHighlight';
