function mailChimpImprimirCampanhas() {
  var endpoint = 'campaigns?count=50'
  
  var params = {
    'method': 'GET',
    'muteHttpExceptions': true,
    'headers': {
      'Authorization': 'apikey ' + mailchimp_api_key
    }
  };
  
  var response = UrlFetchApp.fetch(mailchimp_api_root+endpoint, params);
  var data = response.getContentText();
  var json = JSON.parse(data);
  var campaigns = json['campaigns'];

  for(let n in campaigns){
    Logger.log(campaigns[n]['settings']['subject_line']);
  }
}
function mailChimpAdicionarMembro(contato){
  var endpoint = 'lists/'+mailchimp_list_id+'/members';

  contato.nome = contato.nome.toString().split(' ')[0]
  
  var payload = {
    "email_address": contato.email,
    "status": "subscribed",
    "email_type":"text",
    "merge_fields": {
      FNAME: contato.nome,
      LNAME:'',
      PHONE: contato.telefone
    },
    "tags":contato.interesses
  }

  var params = {
    'method': 'POST',
    'muteHttpExceptions': true,
    'headers': {
      'Authorization': 'apikey ' + mailchimp_api_key,
    },
    'payload':JSON.stringify(payload)
  }

  var response = UrlFetchApp.fetch(mailchimp_api_root+endpoint, params)
  Logger.log('Membro adicionado.')
}
function mailChimpEditarMembro(contato){
  var endpoint = 'lists/'+mailchimp_list_id+'/members/'+md5(contato.email.toString()).toString()

  contato.nome = contato.nome.toString().split(' ')[0]

  var payload = {
    'email_address':contato.email,
    'status_if_new':'subscribed',
    'email_type':'text',
    'status':'subscribed',
    'merge_fields':{
      FNAME:contato.nome,
      LNAME:'',
      PHONE:contato.telefone
    }
  }

  var params = {
    'method':'PUT',
    'muteHttpExceptions':true,
    'headers':{
      'Authorization':'apiKey '+ mailchimp_api_key,
    },
    'payload':JSON.stringify(payload)
  }

  var response = UrlFetchApp.fetch(mailchimp_api_root+endpoint, params)
  Logger.log('Atualizadas as informações do membro.')

  mailChimpAdicionarTags(contato)
}
function mailChimpAdicionarTags(contato){
  var endpoint = 'lists/'+mailchimp_list_id+'/members/'+md5(contato.email.toString()).toString()+'/tags'

  tags = {'tags':adaptarTags(contato.interesses)}

  var params = {
    'method':'POST',
    'muteHttpExceptions':true,
    'headers':{
      'Authorization':'apiKey '+ mailchimp_api_key,
    },
    'payload':JSON.stringify({"tags":adaptarTags(contato.interesses)})
  }

  var response = UrlFetchApp.fetch(mailchimp_api_root+endpoint, params)
  Logger.log('As tags '+contato.interesses+' foram adicionadas ao membro.'+'.')
}
function mailChimpObterMembro(){
  var endpoint = 'lists/'+mailchimp_list_id+'/members/'+md5('lucas-lach@hotmail.com').toString()

  var params = {
    'method': 'GET',
    'muteHttpExceptions': true,
    'headers': {
      'Authorization': 'apikey ' + mailchimp_api_key,
    }
  };
  var response = UrlFetchApp.fetch(mailchimp_api_root+endpoint, params);
  var data = response.getContentText();
  var json = JSON.parse(data);
}
function md5(input) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input)
    .reduce((output, byte) => output + (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, '0'), '');
}
function adaptarTags(tags){
  resultado = []
  for (tg in tags){
    for(tag in padrao_tags){
      if(padrao_tags[tag].toLowerCase() == tags[tg].toLowerCase()){
        aux_tag={}
        aux_tag.name = padrao_tags[tag].toUpperCase()
        aux_tag.status = 'active'
        resultado.push(aux_tag)
      }
    }
  }
  return resultado
}
