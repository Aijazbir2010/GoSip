type SearchBarProps = {
    placeholder: string,
    value: string,
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

const SearchBar = ({ placeholder, value, handleChange }: SearchBarProps) => {
  return (
    <div className="w-[95%] md:w-[90%] rounded-2xl flex flex-row">
        <input type="text" className="bg-themeInputBg w-full rounded-l-2xl h-16 px-4 text-themeBlack placeholder:text-themeTextGray outline-none border-none" placeholder={placeholder} value={value} onChange={handleChange}/>
        <div className="h-16 w-20 rounded-r-2xl flex justify-center items-center bg-themeBlack hover:bg-themeBlue transition-colors duration-300 cursor-pointer">
            <i className="fa-solid fa-magnifying-glass fa-xl text-white"></i>
        </div>
    </div>
  )
}

export default SearchBar