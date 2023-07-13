import axios from "axios";
import queryString from "query-string";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
interface PrdItem {
  be_price: number;
  img: string;
  price: number;
  prod_name: string;
  product_no: number;
  sale: number;
  site_name: string;
  site_type: string;
}
interface QueryResult {
  result: PrdItem[];
  total_element: number;
  total_page: number;
}
interface FetchType {
  [key: string]: string;
}
const siteType = ["IN", "ET", "AB", "NA", "OL", "TO", "CL"];

const List: React.FC<{}> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(queryString.parse(location.search));
  const [currentPage, setCurrentPage] = useState(
    queryString.parse(location.search).page ?? 0
  );

  useEffect(() => {
    const parsed = queryString.parse(location.search);
    parsed.page ? setCurrentPage(parsed.page) : setCurrentPage(0);
    setQuery(parsed);
  }, [location.search]);

  // 1. fetch 후 원하는 데이터 골라서 리턴하는 함수 작성
  const fetchProduct = ({
    page,
    query,
    site_type,
  }: FetchType): Promise<QueryResult> => {
    return axios
      .get(process.env.REACT_APP_API_HOST + "/api/v1/product/list", {
        params: {
          size: 10,
          page,
          query,
          site_type,
        },
      })
      .then((res) => {
        const {
          data: { result, total_page, total_element },
        } = res;
        return {
          result,
          total_page,
          total_element,
        };
      });
  };

  // 2. 키값 설정 후 해당 데이터를 받는 리액트쿼리 훅 사용
  const {
    data: { result, total_page, total_element } = {},
    isLoading,
    isError,
  } = useQuery<QueryResult>([query], () => fetchProduct(query as FetchType), {
    refetchOnWindowFocus: false,
    retry: 0,
    onSuccess: (result) => {
      console.log("result", result);
    },
    onError: (err) => {
      console.log("err", err);
    },
  });
  const submitQuery = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (queryRef.current) {
      const currentQueryObj = queryString.parse(location.search);
      let newQueryObj = {};
      if (queryRef.current.value) {
        newQueryObj = {
          ...currentQueryObj,
          page: 1,
          query: queryRef.current.value,
        };
      } else {
        delete currentQueryObj.query;
        newQueryObj = {
          ...currentQueryObj,
          page: 1,
        };
      }
      const toSearch = queryString.stringify(newQueryObj);
      navigate({
        pathname: location.pathname,
        search: toSearch,
      });
    }
  };
  return (
    <>
      {result?.map((v, idx) => (
        <StyledP key={idx}>
          <span className="product_no">{v.product_no}</span>
          <span className="site_type">[{v.site_type}]</span>{" "}
          <span className="prod_name">{v.prod_name}</span>{" "}
        </StyledP>
      ))}
      <div id="pagination">
        {Array(10)
          .fill("_")
          .slice(0, Math.min(10, total_page ?? 10))
          .map((v, idx) => {
            const currentQueryObj = queryString.parse(location.search);
            const newQueryObj = { ...currentQueryObj, page: idx };
            const toSearch = queryString.stringify(newQueryObj);
            return (
              <StyledLink
                to={{
                  pathname: location.pathname,
                  search: toSearch,
                }}
                key={idx}
              >
                {idx}
              </StyledLink>
            );
          })}
      </div>
      <div id="site">
        {siteType.map((v, idx) => {
          const currentQueryObj = queryString.parse(location.search);
          const newQueryObj = { ...currentQueryObj, page: 1, site_type: v };
          const toSearch = queryString.stringify(newQueryObj);
          return (
            <StyledLink
              key={idx}
              to={{
                pathname: location.pathname,
                search: toSearch,
              }}
            >
              {v}
            </StyledLink>
          );
        })}
      </div>
      <form onSubmit={submitQuery}>
        <input type="text" ref={queryRef} />
        <input type="submit" value="SUBMIT" />
      </form>
    </>
  );
};

export default List;

const StyledP = styled.p`
  font-size: 16px;
  .product_no {
  }
  .site_name {
  }
  .prod_name {
  }
`;
const StyledLink = styled(Link)`
  padding: 5px 10px;
  border: 1px solid #000;
  cursor: pointer;
  display: inline-block;
`;
