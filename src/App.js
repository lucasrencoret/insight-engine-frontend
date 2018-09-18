import React, { Component } from 'react';
import './App.css';

class App extends Component {
  
  constructor(){
    super();
    this.querySearch = this.querySearch.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.state = {datamodels : '', date_filters: '', filters: '', sourcetypes_filter: '', field_errors: '', query: false, error:false};
  }
  handleEnter(event){
    if (event.keyCode === 13) document.getElementById('queryBtn').click()
  }
  //This method build an array with the dt & dd tags for the filter display
  buildFilters(response, query){
    const rows = []
    if (response[query]['filters']){ //check if query has filter present
      if (response[query]['filters']['location']){ //filter type location
        rows.push(<dt key='location'>Location:</dt>)
        response[query]['filters']['location'].forEach( (filterSection) => {
          rows.push(<dd key={filterSection}>- {filterSection.join(', ')}</dd>)
        })
      }
      if (response[query]['filters']['src']){ //filter type source
        rows.push(<dt key='src'><br/>Source {response[query]['filters']['src']['and']?'(and)':'(or)'}:</dt>)
        response[query]['filters']['src']['values'].forEach( (filterSection) => {
          rows.push(<dd key={filterSection}>- {filterSection}</dd>)
        })
      }

      if (response[query]['filters']['other']){ //filter type other
        rows.push(<dt key='other'><br/>Other</dt>)
        response[query]['filters']['other']['values'].forEach( (filterSection) => {
          rows.push(<dd key={filterSection}>- {filterSection}</dd>)
        })
      }
    }
    return this.setState({rows: rows})
  }

  //this method parses date filters
  buildDateFilters(date_filters){
    const dates = []
    date_filters.forEach(date => {
      if (date === 'now') { 
        dates.push(new Date()); 
      }
      else if (date[0] === '-'){ 
        dates.push(new Date(new Date() - 3600000*date.slice(1).slice(0, -1))) 
      }
      else{ 
        dates.push(new Date(date.split(':')[0])); 
      }
    })
    return this.setState({dates:dates})
  }

  querySearch(){
    var query = document.getElementById('query').value;


    const myRequest = new Request(`https://stark-refuge-94654.herokuapp.com/${query}`); //request from our backend the query to display
    return fetch(myRequest)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error('Something went wrong on api server!');
      }
    })
    .then(response => {
      
      const datamodels = response[query]['datamodels']?response[query]['datamodels'][0]:''; //get the data model
      const date_filters = response[query]['date_filters']?response[query]['date_filters'][0]:''; //get the date_filters
      this.buildDateFilters(date_filters); //build date filters
      this.buildFilters(response, query); //build filters
      const sourcetypes_filter = response[query]['sourcetypes_filter']?response[query]['sourcetypes_filter']:''; //get sourcetype filter
      const field_errors = response[query]['field_errors']?response[query]['field_errors']:''; //get field errors
      return this.setState({datamodels : datamodels, sourcetypes_filter: sourcetypes_filter, field_errors: field_errors, query: true, error:false}); //, header: header, body: body
    }).catch(error => {
      return this.setState({error: true, query: true}); //display query not found.
    });
  }
  render() {
    const { query, datamodels, sourcetypes_filter, field_errors, dates, rows, error  } = this.state
    return (
      <div className="App">
        {
          !query?
          <header className="App-header">
            <img src="https://d1qb2nb5cznatu.cloudfront.net/startups/i/44697-37681f503495032ed7d518a9c8007471-medium_jpg.jpg?buster=1486146724" className="App-logo" alt="logo" />
            <h1 className="App-title">Insight Engines</h1>
          </header>
          : ''}
        <div className={query?"small":''}>
        {query?<img src="https://d1qb2nb5cznatu.cloudfront.net/startups/i/44697-37681f503495032ed7d518a9c8007471-medium_jpg.jpg?buster=1486146724" className="App-logo" alt="logo" />:''}
          <div className={query?"Search-box-small":"Search-box"}>
            <div className="Search-container">
              <input className="Search-input" type="text" placeholder="Please insert your query" id="query"/>
            </div>
          </div>
          <div className={query?"Button-box-small":"Button-box"}>
            <div className="Button-container">
              <button className="Search-button" type="button" id="queryBtn" onKeyDown={this.handleEnter} onClick={this.querySearch}>Insight Engine Search</button>
            </div>
          </div>
        </div>
        {
          !query? 
            <p className="App-intro">
              To get started, please enter a query.  <br/><br/>
            </p>
          :
          ''}{
          error? 
            <p className="App-intro">
              Your query is not in the data. Please try a new query.<br/><br/>
            </p>
          :
          ''
        }
        <SearchDisplay datamodels={datamodels} sourcetypes_filter={sourcetypes_filter} field_errors={field_errors} dates={dates} rows={rows} error={error} query={query}/>
      </div>
    );
  }
}


class SearchDisplay extends Component{ //query display component
  render(){
    const { query, datamodels, sourcetypes_filter, field_errors, dates, rows, error  } = this.props
    return(
      <div className="Query-display">
        {query&&!error?  //handling information message to guide user
          <React.Fragment>
            {field_errors['datamodels']? //handling field_errors to display text in red
              <div className="tooltip">Data Models: {datamodels.join(', ')}
                <span className="tooltiptext">{field_errors['datamodels'][0]['invalid']}</span>
              </div>
              :
              <p className="App-intro">Data Models: {datamodels.join(', ')}</p> //display data models
            }
            {field_errors['date_filters']? //handling field_errors to display text in red       
              <div className="tooltip Dates">{dates.join('\n')}
                <span className="tooltiptext">{field_errors['date_filters'][0]['invalid']}</span>
              </div>
              :
              dates.map( date => <p key={date.toString()} className="Dates">{date.toString()}</p>) //display dates in query
            }
            <dl className="Filters">
              {rows}
            </dl>
            {sourcetypes_filter?
              field_errors['sourcetypes_filter']?  //handling field_errors to display text in red
                <div className="tooltip Filters">{sourcetypes_filter}
                  <span className="tooltiptext">{field_errors['sourcetypes_filter'][0]['invalid']}</span>
                </div>
                :
                <p className="Filters">Sourcetype Filter: {sourcetypes_filter}</p>
              : ''
            }
          </React.Fragment>
        : ''}
      </div>
    )
  }
}
export default App;
