import React, { CSSProperties, useCallback, useEffect, useState } from "react";
import axios from "axios";
import Rating from "@material-ui/lab/Rating";
import Select, { ValueType } from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { setFilter } from "store/slices/media";
import styles from "./FilterOptions.module.css";
import { MediaCategory } from "config/constants";
import { AppRootState } from "store";
import { GenreForState, GenreFromResponse } from "config/interface";

const mediaTypesList = [
  {
    label: "Movie",
    value: "movie",
  },
  {
    label: "TV",
    value: "tv",
  },
];
const getYearList = (from: number, to: number) => {
  const yearList = [];
  for (let i = from; i <= to; i++) {
    yearList.push({ label: `${i}`, value: `${i}` });
  }
  return yearList;
};
const yearList = getYearList(1900, new Date().getFullYear());
const dropdownStyle = {
  control: (base: CSSProperties) => ({
    ...base,
    background: "transparent",
    border: "1px solid grey",
  }),
  indicatorSeparator: (provided: CSSProperties) => ({
    ...provided,
    display: "none",
  }),
  dropdownIndicator: (provided: CSSProperties) => ({
    ...provided,
    width: "30px",
  }),
  singleValue: (provided: CSSProperties) => ({
    ...provided,
    color: "white",
    width: "80%",
  }),
};
const FilterOptions = () => {
  const media = useSelector((state: AppRootState) => state.media);
  const [genreList, setGenreList] = useState<GenreForState[]>(() => [
    {
      label: "All",
      value: "All",
    },
  ]);
  const dispatch = useDispatch();
  const { category, filter } = media;
  const { genre, mediaType, rating } = filter;
  const shouldDisableFilterOptions =
    category === MediaCategory.TRENDING || category === MediaCategory.OTHER;

  const handleOptionValue = useCallback(
    (
      filterType: string,
      option: ValueType<{ label: string; value: string }, false>
    ) => {
      let updatedFilterOption = null;
      if (filterType === "mediaType") {
        updatedFilterOption = {
          [filterType]: option?.value,
          genre: { label: "All", value: "All" },
        };
      } else if (filterType === "genre") {
        updatedFilterOption = { [filterType]: option };
      } else {
        updatedFilterOption = { [filterType]: option?.value };
      }
      dispatch(setFilter(updatedFilterOption));
    },
    [dispatch]
  );

  useEffect(() => {
    axios
      .get(
        `https://api.themoviedb.org/3/genre/${mediaType}/list?api_key=${process.env.REACT_APP_API_KEY}`
      )
      .then(({ data }) => {
        const genres: GenreForState[] = data.genres.map(
          (genre: GenreFromResponse) => ({
            label: genre.name,
            value: genre.id,
          })
        );
        setGenreList((prevGenreList) => [...prevGenreList, ...genres]);
      });
  }, [mediaType]);

  return (
    <div className={styles.filterMenu}>
      <span className={styles.title}>DISCOVER OPTIONS</span>
      <div className={styles.dropdownContainer}>
        <div className={styles.dropdown}>
          <span>Type</span>
          <Select
            aria-label="mediaTypeDropdown"
            styles={dropdownStyle}
            options={mediaTypesList}
            defaultValue={mediaTypesList[0]}
            onChange={(option) => handleOptionValue("mediaType", option)}
            isSearchable={false}
            isDisabled={category === MediaCategory.OTHER}
          ></Select>
        </div>
        {genreList.length && (
          <div className={styles.dropdown}>
            <span>Genre</span>
            <Select
              aria-label="genreDropdown"
              styles={dropdownStyle}
              options={genreList}
              defaultValue={genre}
              value={genre}
              onChange={(option) => handleOptionValue("genre", option)}
              isDisabled={shouldDisableFilterOptions}
              isSearchable={false}
            ></Select>
          </div>
        )}
        <div className={styles.yearRange}>
          <span>Year</span>
          <div className={styles.yearRangeContainer}>
            <div className={styles.dropdown}>
              <Select
                aria-label="fromYear"
                styles={dropdownStyle}
                options={yearList}
                defaultValue={yearList[0]}
                onChange={(option) => handleOptionValue("fromYear", option)}
                isDisabled={shouldDisableFilterOptions}
                isSearchable={false}
              ></Select>
            </div>
            <span className={styles.yearRangeDash}>-</span>
            <div className={styles.dropdown}>
              <Select
                aria-label="fromYear"
                styles={dropdownStyle}
                options={yearList}
                defaultValue={yearList[yearList.length - 1]}
                onChange={(option) => handleOptionValue("toYear", option)}
                isDisabled={shouldDisableFilterOptions}
                isSearchable={false}
              ></Select>
            </div>
          </div>
        </div>
      </div>
      <span>Rating</span>
      <Rating
        name="simple-controlled"
        value={parseInt(rating) / 2}
        onChange={(event, newValue) => {
          const rating = newValue && newValue * 2;
          dispatch(setFilter({ rating }));
        }}
        disabled={shouldDisableFilterOptions}
      />
    </div>
  );
};

export default FilterOptions;
