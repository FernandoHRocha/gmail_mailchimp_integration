
const padrao_tags = ['autocad','revit','sketchup','excel','design gráfico','edição de vídeo','office','produto','promob','solidworks','design jogos','photoshop','illustrator']

function buscarEmails() {
  var threads = GmailApp.getInboxThreads();
  for (var a = 0; a < threads.length; a++) {
    var messages = GmailApp.getMessagesForThread(threads[a]);
    for (var i = 0 ; i < messages.length; i++) {
      if (messages[i].getFrom() == "SOFTGRAF Guarapuava <wordpress@softgrafguarapuava.com.br>" && messages[i].isUnread()) {
        lerEmail(messages[i])
        threads[a].markRead()
      }
    }
  }
}
function extrairTags(tag){
  tag = tag.toLowerCase()
  let treinamento = []
  for(let n in padrao_tags){
    if(tag.search(padrao_tags[n])!=-1){
      treinamento.push(padrao_tags[n].toUpperCase())
    }
  }
  return treinamento
}
function normalizarTelefone (telefone) {
  return telefone.trim().replace('(','').replace(')','').replace('-','')
}
function lerEmail(email){
  var capital = (texto)=>{
    primeiraLetra = result.trim().slice(0,1)
    return result.replace(primeiraLetra,primeiraLetra.toUpperCase())}

  var extrair = (body,de,ate,capitalize) => {
    start = body.indexOf(de) + de.length
    end = body.indexOf(ate)
    result = body.substring(start,end).trim().toLowerCase()
    if(capitalize){return capital(result)}
    return result}

  corpo = email.getPlainBody();
  contato={}
  contato.nome = extrair(corpo,"Nome:","E-mail:", true)
  contato.email = extrair(corpo,"E-mail:","Telefone:",false)
  contato.telefone = normalizarTelefone(extrair(corpo,"Telefone:","Dia(s) de preferência:",false))
  contato.interesses = extrairTags(extrair(corpo,"Treinamento(s):","https://softgrafguarapuava.com.br",false))
  
  Logger.log('Novo e-mail de '+contato.nome+'.')
  reconhecerContato(contato)
}
function reconhecerContato(contato){
  let planilha = 'interessados'
  let basedados = SpreadsheetApp.openById('1A-KUnl16FrOP_q2YLTVZKLfAB-89qQKA917QLyHnT14').getSheetByName(planilha)

  let atualizarContato = (contato, telefone, tag) => {
    if(contato.telefone != telefone){
      return true}
    if(extrairTags(tag +","+ contato.interesses.toString()) != tag){
      return true}
    return false
  }
  for(n=2;n<basedados.getLastRow()+1;++n){
    email = basedados.getRange(n,2).getValue().toString().trim()
    if(email == contato.email){
      mailChimpEditarMembro(contato)
      telefone = basedados.getRange(n,3).getValue().toString()
      tag = basedados.getRange(n,4).getValue().toString()
      if(atualizarContato(contato,telefone,tag)){
        contato.interesses = extrairTags(tag +","+ contato.interesses).toString()
        if(contato.telefone != '')
          basedados.getRange(n,3).setValue(contato.telefone)
        basedados.getRange(n,4).setValue(contato.interesses)
        return
      }
      return
    }
  }
  add_contato = []
  for(chave in contato){
    add_contato.push(contato[chave].toString())
  }
  basedados.appendRow(add_contato)
  mailChimpAdicionarMembro(contato)
}
