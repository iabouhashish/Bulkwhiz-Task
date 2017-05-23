import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './App.css';
import checkmark from './check.png';
import add from './add.png';
import cross from './cross.png';
import checkout from './checkout.png';


class Fetch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      clusters: [],
      routers: [],
      filters: [],
      MetaData: [],
      skuLink: ''
    };

    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.getIndex = this.getIndex.bind(this);
    this.getAllRouters = this.getAllRouters.bind(this);
    this.getAllFilters = this.getAllFilters.bind(this);
    this.getAllClusters = this.getAllClusters.bind(this);
    this.getMetaData = this.getMetaData.bind(this);
    this.skuChange = this.skuChange.bind(this);
    this.clearSku = this.clearSku.bind(this);
  }


  componentDidUpdate() {
    //add https://crossorigin.me/ to the link for it to work
    var link = this.state.skuLink;
    if (link !== '') {
      let prefix = "https://crossorigin.me/";
      let link2 = prefix + link;
      if (this.state.items.length === 0) {
        axios.get(link2)
        .then((res) => {
          var items = res.data.items;
          this.setState({items: items}, this.getMetaData);
        }

          ).catch(function (error) {
            console.log(error);
          });
      }
    }
  }

  getIndex(value, arr) {
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] === value) {
            return i;
        }
    }
    return -1;
  }

  getMetaData() {
    var meta = [];
    var item = this.state.items[0].sub_category_metadata;
    meta.push(item);
    this.setState({MetaData: meta}, this.getAllRouters);
  }

  getAllRouters() {
    var rout = this.state.MetaData[0].router;
    var route = ['Any Kind'];

    for (var i = this.state.items.length - 1; i >= 0; i--) {
      var elm = this.state.items[i].properties[rout]
      if (this.getIndex(elm, route) === -1) {
        route.push(elm);
      }
    }
    this.setState({routers: route}, this.getAllFilters);
  }

  getAllFilters() {
    var rout = this.state.MetaData[0].filter;
    var filters = ['All'];

    for (var i = this.state.items.length - 1; i >= 0; i--) {
      var elm = this.state.items[i].properties[rout]
      if (this.getIndex(elm, filters) === -1) {
        filters.push(elm);
      }
    }
    this.setState({filters: filters}, this.getAllClusters);
  }

  getAllClusters() {
    var rout = this.state.MetaData[0].cluster;
    var clusters = [];

    for (var i = this.state.items.length - 1; i >= 0; i--) {
      var elm = this.state.items[i].properties[rout]
      if (this.getIndex(elm, clusters) === -1) {
        clusters.push(elm);
      }
    }
    this.setState({clusters: clusters});
  }

  
  skuChange(skuLink) {
    this.setState({skuLink});
  }

  clearSku(e) {
    this.skuChange('');
    this.setState({items: []});
    this.setState({clusters: []});
    this.setState({routers: []});
    this.setState({filters: []});
    this.setState({selected: []});
    this.setState({MetaData: []});
  }

  render() {
    var name = null;
    if (this.state.MetaData[0] != null) {
      if (this.state.skuLink === '') {
        name = <Link sku={this.state.skuLink} skuChange={this.skuChange}/>
      } else {
        name = (
          <div className="">
            <div className="left">
              <h2>{this.state.MetaData[0].title}</h2>
              <h3>{this.state.items.length} {this.state.MetaData[0].title} products available </h3>
            </div>
            <div className="right">
            <button type="button" onClick={this.clearSku}> Clear </button>
            </div>
          </div>
          )
      }
    } else {
      name = <Link sku={this.state.skuLink} skuChange={this.skuChange}/>
    }

    return (
      <div className="col">
        <div className="header">
          {name}
        </div>
        <Filters clusters={this.state.clusters} routers={this.state.routers} 
        filters={this.state.filters} shown={this.state.items} meta={this.state.MetaData} 
        selected={this.props.selected} updateSelected={this.props.updateSelected}/>
      </div>
    );
  }
}

class Link extends React.Component {
    constructor() {
    super();
    this.state = {
      userInput: 'Please input subcategory URL'
    }
    this.handleChange = this.handleChange.bind(this);
  }
  
  handleChange(e) {
    if (e.key === 'Enter') {
      const sku = e.target.value;
      this.setState({userInput: sku});
      this.props.skuChange(sku);
    }
  }
  
  render() {
    return (
      <div>
        <h3>API SUBCATEGORY LINK </h3>
        <input className="inputSku" type="text" name="sku"
          onKeyPress={this.handleChange}/>
      </div>
    )
  }

}

class Filters extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
        activeRouter: 'Any Kind',
        activeFilter: 'All',
        items: []
      };

    this.handleClick = this.handleClick.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  handleClick(e) {
    if (e.target.title === "router") {
      this.setState({activeRouter: e.target.value}, this.applyFilters);
    } else if (e.target.title === "filter") {
      this.setState({activeFilter: e.target.value}, this.applyFilters);
    }
  }

  componentWillReceiveProps() {
    var items = [];

    for (var i = this.props.shown.length - 1; i >= 0; i--) {
      items.push(this.props.shown[i]);
    }
    this.setState({items: items});
  }

  applyFilters() {
    var routerA = this.state.activeRouter;
    var filterA = this.state.activeFilter;
    var filter = this.props.meta[0].filter;
    var router = this.props.meta[0].router;
    var items = [];

    for (var i = this.props.shown.length - 1; i >= 0; i--) {
      if (routerA === 'Any Kind' && filterA === 'All') {
        items.push(this.props.shown[i]);
      } else if (routerA === 'Any Kind') {
        if(this.props.shown[i].properties[filter] === filterA) {
          items.push(this.props.shown[i]);
        }
      } else if (filterA === 'All') {
        if(this.props.shown[i].properties[router] === routerA) {
          items.push(this.props.shown[i]);
        }
      }
      if(this.props.shown[i].properties[filter] === filterA && this.props.shown[i].properties[router] === routerA) {
        items.push(this.props.shown[i]);
      }
    }

    this.setState({items: items});
  }

  render() {
    let name = null;
    if (this.props.meta[0] != null) {
      name = <h2> What Type of <strong>{this.props.meta[0].title}</strong> are you looking for?</h2>
    } else {
      name = <h2> </h2>
    }
    let fil = null;
    if (this.props.meta[0] != null) {
      fil = <h2> Filter by </h2>
    } else {
      fil = <h2> </h2>
    }

    return(
      <div className="rest">
        {name}
        <div className="RoutersGroup">
        {this.props.routers.map(router =>
          <button id="rcorners1" className={this.state.activeRouter === router ? 'active' : ''} title="router" key={router} value={router} onClick={this.handleClick}>{router}</button>
        )}
        </div>
        {fil}
        <div className="FiltersGroup">
        {this.props.filters.map(filter =>
          <button id="rcorners1" className={this.state.activeFilter === filter ? 'active' : ''} title="filter" key={filter} value={filter} onClick={this.handleClick}>{filter}</button>
          )}
        </div>
        <ItemList clusters={this.props.clusters} shown={this.state.items}  clusterVar={this.props.meta} 
        selected={this.props.selected} updateSelected={this.props.updateSelected}/>
      </div>
    );
  }
}

class ItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      descriptors: '',
      items: []
    };

    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.groupClusters = this.groupClusters.bind(this);
    this.populateWithItems = this.populateWithItems.bind(this);
    this.getIndex = this.getIndex.bind(this);
  }

  componentWillReceiveProps() {
    var prop = this.props.clusterVar[0];
    if (prop === undefined || prop === null) {
    } else {
      var des = prop.descriptor;
      this.setState({descriptors: des}, this.groupClusters);
    }
  }

  groupClusters() {
    var clus = this.props.clusterVar[0].cluster;
    var clusters = [];

    for (var i = this.props.shown.length - 1; i >= 0; i--) {
      var elm = this.props.shown[i].properties[clus]
      if (this.getIndex(elm, clusters) === -1) {
        clusters.push({name: elm, elements: []});
      }
    }
    var clu = this.populateWithItems(clusters, this.props.shown, clus);
    this.setState({items: clu});
  }

  getIndex(value, arr) {
    for(var i = 0; i < arr.length; i++) {
        if(arr[i].name === value) {
            return i;
        }
    }
    return -1;
  }

  populateWithItems(array, elements, el) {
    let ar = array.slice();
    for (var i = ar.length - 1; i >= 0; i--) {
      for (var j = elements.length - 1; j >= 0; j--) {
        if (elements[j].properties[el] === ar[i].name) {
          ar[i].elements.push(elements[j]);
        }
      }
    }
    return ar;
  }

  render() {
    return(
      <div className="listItems">
        {this.state.items.map((category, index) =>
          <div key={index}>
          <h2>{category.name}</h2>
          <Items items={category.elements} descriptors={this.state.descriptors} selected={this.props.selected} updateSelected={this.props.updateSelected}/> 
          </div> 
        )}
      </div>
    );
  }
}
class Items extends React.Component {
  render() {
    return(
      <div className="items">
      {this.props.items.map(element =>
        <Item descriptors={this.props.descriptors} item={element} key={element.id} selected={this.props.selected} updateSelected={this.props.updateSelected}/>
      )}
      </div>
    );
  }
}

class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      descriptors: []
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.addToSelected = this.addToSelected.bind(this);

  }

  componentDidMount() {
    var descript = [];
    var cut = this.props.descriptors.split(" ");
    for (var i = 0; i < cut.length; i++) {
      var one = cut[i].split("{");
      var two = one[1].split("}");
      var thin = this.props.item.properties[two[0]];
      descript.push(thin);
    }
    this.setState({descriptors: descript});
  }

  addToSelected(e) {
    this.props.updateSelected(this.props.item);
  }

  render() {
    var img = add;
    var array = this.props.selected;
    for (var i = array.length - 1; i >= 0; i--) {
      if(array[i].id === this.props.item.id) {
        img = checkmark;
      }
    }
    return(
      <div  className="">
        <div className="row item">
          <div className="col item">
            <div className="itemImage">
              <img src={this.props.item.photo_url_small} />
            </div>
          </div>
          <div className="col item">
              <div className="itemText">
              {this.state.descriptors[0]} {this.state.descriptors[1]} x{this.state.descriptors[2]}
              </div>
          </div>
          <div className="col item check">
              <a onClick={this.addToSelected}><img src={img}/> </a>
          </div>
        </div>
      </div>
    );
  }
}

class Selected extends React.Component {
  render() {
    return(
      <div className="col">
        <div className="header table">
          <div className="left">
            <div>
              <h1> Your shopping list </h1>
            </div>
            <div>
              <p>Proceed to checkout </p>
            </div>
          </div>
          <div className="check right">
            <button type="button" className="button"> Checkout </button>
          </div>
        </div>
        <div className="rest">
          <h3>What's In your shopping list </h3>
          <SelectedItems items={this.props.selected} updateSelected={this.props.updateSelected}/>
        </div>
      </div>
    );
  }
}

class SelectedItems extends React.Component {
  render() {
    return (
      <div>
        {this.props.items.map(item =>
            <SelectedItem item={item} key={item.id} updateSelected={this.props.updateSelected}/>
          )}
      </div>
    );
  }
}

class SelectedItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      label: '',
      descriptors: [],
    }
    this.addToSelected = this.addToSelected.bind(this);
  }

  addToSelected(e) {
    this.props.updateSelected(this.props.item);
  }

  render() {
    return(
      <div  className="">
        <div className="row item">
          <div className="col item">
            <div className="itemImage">
              <img src={this.props.item.photo_url_small} />
            </div>
          </div>
          <div className="col item">
              <div>
              {this.props.item.properties.label}
              </div>
              <div>
              {this.props.item.properties.unit_quantity} {this.props.item.properties.container} x{this.props.item.properties.bw_pack_size}
              </div>
          </div>
          <div className="col item check">
              <a onClick={this.addToSelected}><img src={cross}/> </a>
          </div>
        </div>
      </div>
    );
  }
}


class MainApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: [],
    };

    this.updateSelected = this.updateSelected.bind(this);
  }

  updateSelected(e) {
    var array = this.state.selected;
    var array2 = this.state.selected.slice();
    var indexV = array.indexOf(e);

    if (indexV === -1) {
      array2.push(e);
    } else {
      array2.splice(indexV, 1);
    }
    this.setState({selected: array2});
  }

  render() {
    return(
      <div className="row main">
        <Fetch selected={this.state.selected} updateSelected={this.updateSelected}/>
        <Selected selected={this.state.selected} updateSelected={this.updateSelected}/>
      </div>
    );
  }
}

ReactDOM.render(
  <MainApp/>,
  document.body
);