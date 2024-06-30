import React, {useEffect, useState} from 'react'

import NewsItem from './Newsitem'
import Spinner from './Spinner';
import PropTypes from 'prop-types'
import InfiniteScroll from "react-infinite-scroll-component";
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

const News = (props)=>{
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    //const [showPositiveOnly, setShowPositiveOnly] = useState(false);
   
    
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    } 

    const updateNews = async ()=> {
        props.setProgress(10);
        const url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${props.apiKey}&page=${page}&pageSize=${props.pageSize}`; 
        setLoading(true)
        let data = await fetch(url);
        props.setProgress(30);
        let parsedData = await data.json()
        props.setProgress(70);
        const analyzedArticles = parsedData.articles.map(article => {
            const text = `${article.title} ${article.description}`;
            const sentimentResult = sentiment.analyze(text);
            return {...article, sentiment: sentimentResult, isPositive: sentimentResult.score > 0};
        });

        setArticles(analyzedArticles)
        setTotalResults(parsedData.totalResults)
        setLoading(false)
        props.setProgress(100);
    }

    useEffect(() => {
        document.title = `${capitalizeFirstLetter(props.category)} - NewsApp`;
        updateNews(); 
        // eslint-disable-next-line
    }, [])


    const fetchMoreData = async () => {   
        const url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${props.apiKey}&page=${page+1}&pageSize=${props.pageSize}`;
        setPage(page+1) 
        let data = await fetch(url);
        let parsedData = await data.json()
        const analyzedArticles = parsedData.articles.map(article => {
            const text = `${article.title} ${article.description}`;
            const sentimentResult = sentiment.analyze(text);
            return {...article, sentiment: sentimentResult, isPositive: sentimentResult.score > 0};
        });
        setArticles(articles.concat(analyzedArticles))
        setTotalResults(parsedData.totalResults)
      };

    //   const filterPositiveNews = () => {
    //     return articles.filter(article => {
    //         const result = sentiment.analyze(article.title + ' ' + article.description);
    //         return result.score > 0;
    //     });
  //  };

    // const displayedArticles = showPositiveOnly ? filterPositiveNews() : articles;
    // const togglePositiveNews = () => {
    //     setShowPositiveOnly(!showPositiveOnly);
    // }

    const filteredArticles = props.showPositiveOnly ? articles.filter(article => article.isPositive) : articles;

 
        return (
            <>
                <h1 className="text-center" style={{ margin: '35px 0px', marginTop: '90px' }}>NewsApp - Top {capitalizeFirstLetter(props.category)} Headlines</h1>
                {/* <div className="text-center">
                <button onClick={() => setShowPositiveOnly(!showPositiveOnly)} className="btn btn-primary">
                    {showPositiveOnly ? 'Show All News' : 'Show Positive News'}
                </button>
            </div> */}
            {/* <div className="text-center">
            <button onClick={togglePositiveNews} className="btn btn-primary">
            {showPositiveOnly ? 'Show All News' : 'Show Positive News Only'}
            </button>
            </div> */}

                {loading && <Spinner />}
                <InfiniteScroll
                    dataLength={filteredArticles.length}
                    next={fetchMoreData}
                    hasMore={articles.length !== totalResults}
                    loader={<Spinner/>}
                > 
                    <div className="container">
                         
                    <div className="row">
                        {filteredArticles.map((element) => {
                            return <div className="col-md-4" key={element.url}>
                                <NewsItem title={element.title ? element.title : ""} 
                                description={element.description ? element.description : ""} 
                                imageUrl={element.urlToImage}
                                 newsUrl={element.url} 
                                author={element.author} 
                                date={element.publishedAt} 
                                source={element.source.name}
                                sentimentScore={element.sentiment.score}
                                />
                            </div>
                        })}
                    </div>
                    </div> 
                </InfiniteScroll>
            </>
        )
    
}


News.defaultProps = {
    country: 'in',
    pageSize: 8,
    category: 'general',
}

News.propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
}

export default News