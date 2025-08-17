import { useLocation, Link } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="mb-0">
      <nav className="p-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
          </li>
          {pathnames
            .filter((value) => value.toLowerCase() !== "home")
            .map((value, index, arr) => {
              const to = `/${pathnames
                .filter((v) => v.toLowerCase() !== "home")
                .slice(0, index + 1)
                .join("/")}`;
              const isLast = index === arr.length - 1;

              return (
                <li key={to} className="flex items-center">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isLast ? (
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {decodeURIComponent(value)}
                    </span>
                  ) : (
                    <Link
                      to={to}
                      className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {decodeURIComponent(value)}
                    </Link>
                  )}
                </li>
              );
            })}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumbs;
