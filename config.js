const path=require("path"),default_cfg=path.join(__dirname,"charging_plugin.json"),cfg_path="production"===process.env.NODE_ENV?path.join("/etc","nigulp_gnigrahc.json"):default_cfg,fs=require("fs");exports.read=async()=>{let _cfg_path;try{await fs.promises.access(cfg_path),_cfg_path=cfg_path}catch(e){_cfg_path=default_cfg}var cfg=await fs.promises.readFile(_cfg_path,"utf8");return JSON.parse(cfg)},exports.save=async cfg=>{if(cfg)return fs.promises.writeFile(cfg_path,JSON.stringify(cfg))},exports.validatePort=async opts=>{let cfg=await exports.read();return cfg.ports.find(p=>p.id!==opts.id&&p.pin===opts.pin)?Promise.reject(new Error(`GPIO PIN:${opts.pin} is already used`)):opts.pin?opts.alias?cfg.ports.find(p=>p.id!==opts.id&&p.alias===opts.alias)?Promise.reject(new Error("Please input different ALIAS")):isNaN(parseInt(opts.pin))?Promise.reject(new Error("GPIO PIN is invalid")):void 0:Promise.reject(new Error("Please enter ALIAS")):Promise.reject(new Error("Please enter GPIO PIN"))},exports.addPort=async port=>{port.pin=parseInt(port.pin),port.id=parseInt(99001*Math.random()+999),await exports.validatePort(port);let cfg=await exports.read();cfg.ports=cfg.ports||[];port={id:port.id,pin:port.pin,alias:port.alias};return cfg.ports.push(port),await exports.save(cfg),port},exports.updatePort=async(id,port)=>{port.pin=parseInt(port.pin);let cfg=await exports.read();var e=cfg.ports.findIndex(p=>p.id===id);if(e<0)return Promise.reject(new Error("Port not found!"));await exports.validatePort({id:id,...port});port={id:id,pin:port.pin,alias:port.alias};return cfg.ports[e]=port,await exports.save(cfg),port},exports.deletePort=async id=>{let cfg=await exports.read();var e=cfg.ports.findIndex(p=>p.id===id);return e<0?Promise.reject(new Error("Port not found!")):(cfg.ports.splice(e,1),exports.save(cfg))},exports.validateRate=async opts=>{let cfg=await exports.read();return cfg.rates.find(p=>p.id!==opts.id&&p.amount===opts.amount)?Promise.reject(new Error(`Amount ${opts.amount} already exists`)):opts.amount?opts.time_minutes?isNaN(parseInt(opts.time_minutes))||parseInt(opts.time_minutes)<=0?Promise.reject(new Error("Please enter valid Time")):isNaN(opts.exp_minutes)||opts.exp_minutes<0?Promise.reject(new Error("Please enter valid Expiration Time")):void 0:Promise.reject(new Error("Please enter Time")):Promise.reject(new Error("Please enter Amount"))},exports.addRate=async rate=>{rate.time_minutes=parseInt(rate.time_minutes),rate.exp_minutes=parseInt(rate.exp_minutes),rate.amount=parseInt(rate.amount),rate.id=parseInt(99001*Math.random()+999),await exports.validateRate(rate);let cfg=await exports.read();cfg.rates=cfg.rates||[];rate={id:rate.id,amount:rate.amount,time_minutes:rate.time_minutes,exp_minutes:rate.exp_minutes};return cfg.rates.push(rate),await exports.save(cfg),rate},exports.updateRate=async(id,rate)=>{rate.time_minutes=parseInt(rate.time_minutes),rate.amount=parseInt(rate.amount),rate.id=parseInt(id);let cfg=await exports.read();var e=cfg.rates.findIndex(p=>p.id===id);if(e<0)return Promise.reject(new Error("Rate setting not found!"));await exports.validateRate({id:id,...rate});rate={id:id,amount:rate.amount,time_minutes:rate.time_minutes,exp_minutes:rate.exp_minutes};return cfg.rates[e]=rate,await exports.save(cfg),rate},exports.deleteRate=async id=>{let cfg=await exports.read();var e=cfg.rates.findIndex(p=>p.id===id);return e<0?Promise.reject(new Error("Rate setting not found!")):(cfg.rates.splice(e,1),exports.save(cfg))};