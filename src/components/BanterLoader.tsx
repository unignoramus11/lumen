/**
 * @file This file defines the BanterLoader component, a visual loading indicator.
 * It uses a set of animated boxes to create a dynamic and engaging loading animation.
 * The styling for this component is defined in `BanterLoader.css`.
 */

import "./BanterLoader.css";

/**
 * BanterLoader component displays a unique loading animation.
 * It consists of nine animated boxes that create a visually appealing loading state.
 * @returns {JSX.Element} The JSX for the BanterLoader component.
 */
export default function BanterLoader() {
  return (
    <div className="banter-loader">
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
    </div>
  );
}
