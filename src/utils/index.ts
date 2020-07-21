const getLocationQuery = (searchText) => {

  let search;
  if(!searchText){
    search = window.location.search;
  }else{
    search = searchText;
  }

  const query: {[key: string]: any} = {};

  if(search && search.indexOf('?') === 0){
    search = search.substr(1);

    const searchList = search.split('&');

    const len = searchList.length;

    if(len !== 0){
      for(let i = 0; i<len; i++){

        const item = searchList[i];

        if(item.indexOf('=') !== -1){
          const [label, value] = item.split('=');
          if(label !== ''){
            query[label] = decodeURIComponent(value);
          }
        }

      }
    }

  }

  return query;

};

function getUid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}

export {
  getLocationQuery,
  getUid,
}
