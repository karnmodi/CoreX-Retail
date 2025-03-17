import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const TableData = ({ data, columns, title, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const RowsPerPage = 8;

  useEffect(() => {
    if (!isSearchVisible) {
      setSearchText("");
    }
  }, [isSearchVisible]);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }
  };

  const sortData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const filterData = (data) => {
    if (!searchText) return data;

    return data.filter((item) =>
      columns.some((column) => {
        const value = column.format 
          ? column.format(item[column.key], item)
          : item[column.key];
        return value?.toString().toLowerCase().includes(searchText.toLowerCase());
      })
    );
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredData = filterData(data);
  const sortedData = sortData(filteredData);
  const totalPages = Math.ceil(sortedData.length / RowsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * RowsPerPage,
    currentPage * RowsPerPage
  );

  const handleRowClick = (item) => {
    if (onRowClick) {
      onRowClick(item);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">{title} </h2>
        
        <div className="relative flex items-center justify-end">
          <div className={`flex items-center transition-all duration-300 ease-in-out ${
            isSearchVisible 
              ? 'w-full sm:w-64 opacity-100' 
              : 'w-0 opacity-0'
          }`}>
            <Input
              id="search-input"
              type="text"
              placeholder="Search.."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`w-full border rounded-2xl pr-8 ${
                isSearchVisible ? `block` : 'hidden'
              }`}
            />
            {isSearchVisible && (
              <button
                onClick={toggleSearch}
                className="absolute right-2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          <button
            onClick={toggleSearch}
            className={`p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 ${
              isSearchVisible ? 'hidden' : 'block'
            }`}
          >
            <Search className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border shadow-sm overflow-hidden">
          <div className="min-w-full align-middle">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      key={column.key}
                      onClick={() => requestSort(column.key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {sortConfig.key === column.key && (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentData.map((item, index) => (
                  <TableRow
                    key={item.id || index}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRowClick(item)}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} className="px-4 py-2">
                        {column.format
                          ? column.format(item[column.key], item)
                          : item[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
      </div>

      {/* Responsive Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500 order-2 sm:order-1">
          Showing {Math.min(currentData.length, RowsPerPage)} of{" "}
          {filteredData.length} entries
        </div>
        <div className="flex space-x-2 order-1 sm:order-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableData;