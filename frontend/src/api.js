async function request(url,options={}) {
  let res;
  try {res = await fetch(`/api${url}`,{headers:{"Content-Type":"application/json"},...options});}
  catch { throw new Error("Não foi possível conectar à API."); }
  if(!res.ok) {const data=await res.json().catch(()=>({}));throw new Error(typeof data.detail==="string"?data.detail:`HTTP ${res.status}`);}
  return res.status===204?null:res.json();
}
export const api = {
  movies: () => request("/movies"),
  createMovie: (data) => request("/movies", {method:"POST",body:JSON.stringify(data)}),
  updateMovie: (id,data) => request(`/movies/${id}`, {method:"PUT",body:JSON.stringify(data)}),
  deleteMovie: (id) => request(`/movies/${id}`, {method:"DELETE"}),
};

