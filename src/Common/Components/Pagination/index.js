// @flow
import React from "react";
import "./styles.scss";

type PaginationProps = {
  goTo: (p: number) => void,
  fwd: () => void,
  bcwd: () => void,
  count: number,
  current: number
};

export const Pagination = ({ goTo, fwd, bcwd, count, current }: PaginationProps) => {
  const goToPage = (e: SyntheticEvent<HTMLLIElement>) => {
    const pageNumber = +e.currentTarget.dataset.page;
    goTo(pageNumber);
  };
  return (
    <ul className="pagination">
      <li className="pagination__item prev" onClick={bcwd}>
        В начало
      </li>
      {[...Array.from(new Array(count), (v: number, i: number) => i + 1)].map((p: number) => (
        <li className={`pagination__item ${current === p ? "active" : ""}`} key={p} onClick={goToPage} data-page={p}>
          {p}
        </li>
      ))}
      <li className="pagination__item next" onClick={fwd}>
        Дальше
      </li>
    </ul>
  );
};

export default Pagination;
