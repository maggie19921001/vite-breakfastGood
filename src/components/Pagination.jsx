function Pagination ({pageInfo, pageChange}){
    return(     
    <div className="d-flex justify-content-center">
        <nav>
            <ul className="pagination">
            <li className={`page-item ${ !pageInfo.has_pre && 'disabled' }`}>
                <a onClick={()=> pageChange(pageInfo.current_page -1)} className="page-link" href="#">
                上一頁
                </a>
            </li>

            {Array.from({ length: pageInfo.total_pages }).map((_,index) => (
                            <li className={`page-item ${ pageInfo.current_page === index+1 && 'active' }`} key={index}>
                            <a onClick={()=> pageChange(index+1)} className="page-link" href="#">
                            { index+1 }
                            </a>
                        </li>
            ))}

            <li className={`page-item ${ !pageInfo.has_next && 'disabled' }`}>
                <a onClick={()=> pageChange(pageInfo.current_page +1)} className="page-link" href="#">
                下一頁
                </a>
            </li>
            </ul>
        </nav>
    </div>
    )
}

export default Pagination;