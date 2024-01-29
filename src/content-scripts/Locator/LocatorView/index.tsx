import classNames from 'classnames';

import { LocatorViewMode, type LocatorViewProps } from '../types';
import PathList from './PathList';
import { useViewStates } from './useViewStates';
import { FocusSvg } from './PathList/Focus';

import styles from './index.module.less';

export const LocatorView = (props: LocatorViewProps) => {
  const {
    viewMode,
    position,
    sourceData,
    clickElementBundle,
    firstHasSourceBundle,
    jumpToEditor,
    visible,
    closeContainer,
    rootRef,
    displayDirection,
  } = useViewStates(props);

  if (viewMode === LocatorViewMode.SINGLE) return null;

  if (viewMode === LocatorViewMode.MULTI && sourceData)
    return (
      <div
        ref={rootRef}
        className={styles.locatorContainer}
        style={{
          display: visible ? 'block' : 'none',
          transform: `translate( ${position.x}px , ${position.y}px )`,
        }}
      >
        <div className={styles.svgContainer}>
          <FocusSvg />
        </div>
        <div
          className={classNames(
            styles.pathContainer,
            styles[`containerDirection${displayDirection}`]
          )}
        >
          <PathList
            pathList={sourceData}
            jumpToEditor={jumpToEditor}
            close={closeContainer}
            listDirection={displayDirection}
            clickElementBundle={clickElementBundle}
            firstHasSourceBundle={firstHasSourceBundle}
          />
        </div>
      </div>
    );

  return null;
};
