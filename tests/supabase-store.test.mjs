import test from "node:test";
import assert from "node:assert/strict";
import { createSupabaseStore } from "../backend/supabase-store.mjs";

// Synthetic fixtures for isolated tests only. Never imported into production.
const options = {url:"https://example.supabase.co",key:"test-server-credential"};
const empty = () => Object.fromEntries(["spaces","evidence","issues","evaluations","relations","stakeholders","projects","regulations","entity_links"].map(k => [k,[]]));
const review = {status:"pending",category:"otra observación",completeness:30,moderationNote:"test",missing:[]};
const input = {spaceId:"test-space",text:"Synthetic contribution used only in a unit test.",latitude:0,longitude:0};
test("rejects invalid endpoint and public credentials", () => {
  assert.throws(() => createSupabaseStore({...options,url:"http://example.supabase.co"}));
  assert.throws(() => createSupabaseStore({...options,key:"sb_publishable_example"}));
});
test("uses new secret keys without an invalid Bearer header", async () => {
  const data = empty();
  data.spaces=[{id:"test-space"}];
  const seen=[];
  await createSupabaseStore({...options,key:"sb_secret_example",fetcher:async(url,request) => {
    seen.push(request.headers);
    return Response.json(data);
  }}).readDashboard();
  assert.equal(seen[0].apikey,"sb_secret_example");
  assert.equal(seen[0].Authorization,undefined);

  await createSupabaseStore({...options,key:"legacy-service-role-jwt",fetcher:async(url,request) => {
    assert.equal(request.headers.Authorization,"Bearer legacy-service-role-jwt");
    return Response.json(data);
  }}).readDashboard();
});
test("maps the existing dashboard contract and preserves missing values", async () => {
  const data = empty();
  data.spaces=[{id:"test-space",source_url:null,area_sqm:null}];
  data.relations=[{id:"test-relation",shared_mechanisms:'["test"]',source_space_id:"test-space"}];
  const client=createSupabaseStore({...options,fetcher:async(url,request) => {
    assert.equal(new URL(url).pathname,"/rest/v1/rpc/sv_core_dashboard");
    assert.equal(request.redirect,"manual");
    return Response.json(data);
  }});
  const result=await client.readDashboard();
  assert.equal(result.spaces[0].sourceUrl,null);
  assert.equal(result.spaces[0].areaSqm,null);
  assert.deepEqual(result.relations[0].sharedMechanisms,["test"]);
  assert.equal(result.databaseAvailable,true);
  assert.deepEqual(result.entityLinks,[]);
});
test("fails closed for an empty or unavailable canonical dataset",async () => {
  await assert.rejects(createSupabaseStore({...options,fetcher:async()=>Response.json(empty())}).readDashboard(),/not ready/);
  await assert.rejects(createSupabaseStore({...options,fetcher:async()=>new Response("sensitive details",{status:500})}).readDashboard(),error=>{
    assert.equal(error.message,"Supabase request failed (500)");
    return true;
  });
});
test("saves contribution and asset metadata together, preserving zero coordinates",async () => {
  const calls=[];let n=0;
  const store=createSupabaseStore({...options,uuid:()=>`test-${++n}`,fetcher:async(url,request)=>{
    calls.push({path:new URL(url).pathname,request});return new Response(null,{status:204});
  }});
  const result=await store.saveContribution(input,[new File(["image"],"test.png",{type:"image/png"})],review);
  assert.equal(result.status,"pending");
  assert.equal(calls.length,2);
  assert.match(calls[0].path,/storage\/v1\/object\/sv-contributions/);
  const body=JSON.parse(calls[1].request.body);
  assert.equal(body.p_contribution.latitude,0);
  assert.equal(body.p_contribution.longitude,0);
  assert.equal(body.p_assets[0].contribution_id,body.p_contribution.id);
  assert.equal(body.p_contribution.status,"pending");
});
test("rejects oversized uploads before contacting Supabase",async () => {
  let called=false;
  const store=createSupabaseStore({...options,fetcher:async()=>{called=true;}});
  await assert.rejects(store.saveContribution(input,[{type:"image/png",size:6*1024*1024}],review),/Invalid images/);
  assert.equal(called,false);
});
test("cleans uploaded private objects when a later upload fails",async () => {
  const calls=[];let n=0;
  const store=createSupabaseStore({...options,uuid:()=>`test-${++n}`,fetcher:async(url,request)=>{
    calls.push(request);return new Response(null,{status:calls.length===2?500:204});
  }});
  const images=[new File(["a"],"a.png",{type:"image/png"}),new File(["b"],"b.png",{type:"image/png"})];
  await assert.rejects(store.saveContribution(input,images,review));
  assert.equal(calls.at(-1).method,"DELETE");
  assert.equal(JSON.parse(calls.at(-1).body).prefixes.length,1);
});
test("does not delete images when the commit result is uncertain",async () => {
  const calls=[];
  const store=createSupabaseStore({...options,fetcher:async(url,request)=>{
    calls.push(request);
    if(new URL(url).pathname.includes("/rpc/"))throw new Error("timeout");
    return new Response(null,{status:204});
  }});
  await assert.rejects(store.saveContribution(input,[new File(["image"],"test.png",{type:"image/png"})],review));
  assert.equal(calls.some(c=>c.method==="DELETE"),false);
});
