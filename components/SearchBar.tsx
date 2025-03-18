type SearchBarProps = {
    placeholder: string
}

const SearchBar = ({ placeholder }: SearchBarProps) => {
  return (
    <div className="w-[95%] md:w-[90%] rounded-2xl flex flex-row">
        <input type="text" className="bg-themeInputBg w-full rounded-l-2xl h-16 px-4 text-themeBlack placeholder:text-themeTextGray outline-none border-none" placeholder={placeholder}/>
        <div className="h-16 w-20 rounded-r-2xl flex justify-center items-center bg-themeBlack hover:bg-themeBlue transition-colors duration-300 cursor-pointer">
            <i className="fa-solid fa-magnifying-glass fa-xl text-white"></i>
        </div>
    </div>
  )
}

export default SearchBar