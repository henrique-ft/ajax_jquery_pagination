      $(document).ready(function(){
      
        /*  Ajax Pagination *******************************************************************
        *--------------------------------------------------------------------------------------
        *
        * Revealing module pattern que representa a paginação
        *
        * #lista-busca : id da div que engloba todos os resultados 
        * #paginacao : id da div que engloba os links da paginação
        * data-skip : atributo que vai no link da paginação, para dizer quantos de dados vão ser escapados
        * data-posicao : atributo que mostra a posição da paginação que o link representa
        *
        *--------------------------------------------------------------------------------------
        */
        var resultados = (function(){
            
            var resultados = [];
            var total = 0;
            var posicao_atual = 1;
            var quantidade_por_pagina = 10;
            var carregando = '<div id="carregando" class="loading flex-grid halign-center valign-middle col-0">'+
                                                  '<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>'+
                                                '</div>';
            var carregando_id = '#carregando';
            var nada_encontrado = '<div style="background-color: rgba(183, 183, 183, 0.13);padding: 30px;width: 100%;">Nenhuma notícia encontrada !</div>';

            function setResultados(val)
            {
              resultados = val;
            }
            
            function getResultados()
            {
              return resultados;
            }

            function setPosicaoAtual(val)
            {
              posicao_atual = val;
            }
            
            function getPosicaoAtual()
            {
              return posicao_atual;
            }
            
            function setTotal(val)
            {
              total = val;
            }
            
            /*
            *--------------------------------------------------------------------------------------
            *
            * Função que busca e mostra os resultados
            *
            * -> Adicionar parâmetros de filtros a vontade de acordo com o webservice
            *
            *--------------------------------------------------------------------------------------
            */
            function buscar(filtro, skip, take)
            {
                $('#lista-busca').html(carregando);                           

                /*
                *------------------------------------------------------------------------------------------------
                *
                * Código da busca dos resultados 
                *
                * -> Faz uma requisição ao webservice, enviando os dados que forem necessários
                * -> O webservice retorna os resultados
                * -> Para cada resultado é criado um Html de acordo com a listagem
                *
                *------------------------------------------------------------------------------------------------
                */
                $.post("https://concais-hriqueft.c9users.io/webservice/concais/filtrar-noticias-categoria",
                { 
                  titulo: filtro,
                  skip: skip,
                  //categoria: <?= $categoria['id_categoria'] ?>,
                  categoria: 1,
                  take: take
                },
                function(response,status){
                  
                  /* adiciona classe hidden */
                  $(carregando_id).addClass("hidden");
                  
                  /* filtrado é um atributo do json onde estão todas os resultados */
                  var resultados = JSON.parse(response).filtrado.map(function(value){
                    box_result = '<li class="flex-grid--wrap search__item bg-default--lighten mg-10--bottom col-0">' +
                        '<figure class="flex-grid valign-middle halign-center pd-20 col-0 is-sm">' +
                            '<img class="results__img" src="<?= base_url() ?>uploads/noticias/imagens/'+ value.ds_imagem_noticia +'" alt="'+ value.ds_titulo_noticia_pt +'"></img>' +
                        '</figure>' +
                        '<div class="flex-grid--wrap col pd-20">' +
                            '<p class="flex-grid col-0 is-sm halign-center valign-middle">' +
                                '<i class="fa fa-calendar color-first--lighten mg-10--right col-0" aria-hidden="true"></i>' +
                                '<span class="color-second--lighten bold col-0">'+ value.dt_noticia +'</span>' +
                            '</p>' +
                            '<p class="responsive-text col-12 mg-10--bottom mg-10--top"> ' + value.ds_titulo_noticia_pt.slice(0,70) + '</p>' +
                            '<a class="results__btn btn--second--lighten col-0 self-bottom is-sm" href="<?= base_url() ?>imprensa/'+ value.ds_slug_noticia +'/integra/">' +
                              'Mais Detalhes' +
                            '</a>' +
                        '</div>' +
                    '</li>';
        
                    return box_result;
                    
                  })
                  
                 /*
                  *--------------------------------------------------------------------------------------
                  *
                  * Nada encontrado
                  *
                  *--------------------------------------------------------------------------------------
                  */
                  if(resultados.length < 1){
                    
                    setResultados([nada_encontrado]);
                    
                  } else {
                    
                    setResultados(resultados);

                  }

                  /* total é um atributo do json que representa o total de resultados*/
                  setTotal(JSON.parse(response).total);
    
                  $('#lista-busca').hide().html(getResultados().join('')).fadeIn(250);
                  
                  $('#paginacao').hide().html(getLinksPaginacao(getPosicaoAtual())).fadeIn(250);
                  
                });
            }
            
            /*
            *--------------------------------------------------------------------------------------
            *
            * Função monta os links da paginação
            *
            *--------------------------------------------------------------------------------------
            */
            function getLinksPaginacao(posicao = 1)
            {
              var links = [];
              var qtd_paginas = Math.round(total/quantidade_por_pagina);

              /*
              *------------------------------------------------------------------------------------------
              *
              *  Monta o array com o html dos links
              *
              *------------------------------------------------------------------------------------------
              */
              for($i = 1; $i < qtd_paginas + 1; $i++){
                
                active = (posicao_atual == $i)? 'data-active="true"' : '' ;
                
                links[$i] =' <li class="pagination__item flex-grid col-0">'+
                            '<a class="pagination__link" '+ active +' data-posicao='+$i+' data-skip="'+($i - 1)*quantidade_por_pagina+'">'+$i+'</a>'+
                        '</li>';
              }
              
              switch(parseInt(posicao)){
                
                case 1:
                    corte_inicial = posicao;
                    corte_final = parseInt(posicao) + 9;  
                  break;
                case 2:
                    corte_inicial = parseInt(posicao) - 1;
                    corte_final = parseInt(posicao) + 8; 
                  break;
                case 3:
                    corte_inicial = parseInt(posicao) - 2;
                    corte_final = parseInt(posicao) + 7; 
                  break;
                case 4:
                    corte_inicial = parseInt(posicao) - 3;
                    corte_final = parseInt(posicao) + 6;                  
                  break;
                default:
                    corte_inicial = parseInt(posicao) - 4;
                    corte_final = parseInt(posicao) + 5; 
                  break;
              }
              
              verifica_tamanho = links.slice(parseInt(corte_inicial), parseInt(corte_final)).length;
             
              /* Adiciona os botões de anterior e próximo */
              if (verifica_tamanho < 2) {
                
                return '';
                
              } else {
                
                if (parseInt(posicao_atual) <= 1) {
                   
                  return '<ul class="pagination flex-grid col-0"><ul class="pagination__pages flex-grid col-0">'+
                              links.slice(parseInt(corte_inicial), parseInt(corte_final)).join('') +
                        '</ul>'+
                        '<li class="pagination__item flex-grid mg-10--left col-0">'+
                            '<a class="pagination__link" data-posicao='+$i+' data-skip="Proximo">Próximo</a>'+
                        '</li>'+
                   ' </ul>';
                   
                } else {
                  
                  if (verifica_tamanho < 6) {
                    
                    return  '<ul class="pagination flex-grid col-0">'+
                                '<li class="pagination__item flex-grid mg-10--right col-0">'+
                                    '<a class="pagination__link" data-posicao='+$i+' data-skip="Anterior">Anterior</a>'+
                                '</li>'+
                                '<ul class="pagination__pages flex-grid col-0">'+
                                      links.slice(parseInt(corte_inicial), parseInt(corte_final)).join('') +
                                '</ul>'+
                           ' </ul>';    
                     
                  }
                  
                  return  '<ul class="pagination flex-grid col-0">'+
                              '<li class="pagination__item flex-grid mg-10--right col-0">'+
                                  '<a class="pagination__link" data-posicao='+$i+' data-skip="Anterior">Anterior</a>'+
                              '</li>'+
                              '<ul class="pagination__pages flex-grid col-0">'+
                                    links.slice(parseInt(corte_inicial), parseInt(corte_final)).join('') +
                              '</ul>'+
                              '<li class="pagination__item flex-grid mg-10--left col-0">'+
                                  '<a class="pagination__link" data-posicao='+$i+' data-skip="Proximo">Próximo</a>'+
                              '</li>'+
                         ' </ul>';
                }
              }
            }

            return {
              
              buscar : buscar,
              setTotal : setTotal,             
              setResultados : setResultados,
              setPosicaoAtual : setPosicaoAtual,
              getPosicaoAtual : getPosicaoAtual,
              quantidade_por_pagina : quantidade_por_pagina,
              getResultados : getResultados,
              getLinksPaginacao : getLinksPaginacao

            }
           
        })();

        resultados.setPosicaoAtual(1);
        
        /*
        *--------------------------------------------------------------------------------------
        *
        * Chama a função de busca
        *
        *--------------------------------------------------------------------------------------
        */
        resultados.buscar($("#busca").val(), 0,resultados.quantidade_por_pagina);
        
        /* Evento do clique no botão de busca da busca */
        $(document).on('click','#submit-busca', function($event){ 
            
            $event.preventDefault();
            
            resultados.setPosicaoAtual(1);
            
            /*
            *--------------------------------------------------------------------------------------
            *
            * Chama a função da busca
            *
            *--------------------------------------------------------------------------------------
            */
            resultados.buscar($("#busca").val(), 0,resultados.quantidade_por_pagina);
          
        });
      
        /* Evento do clique nos links paginação */
        $(document).on('click','.pagination__link', function($event){ 
            
            $event.preventDefault();
        
            switch($(this).attr('data-skip')){
              
              case 'Anterior':
                  
                  if (parseInt(resultados.getPosicaoAtual()) > 1) {
                    resultados.setPosicaoAtual(parseInt(resultados.getPosicaoAtual()) - 1);
                  }
                  
                  /*
                  *--------------------------------------------------------------------------------------
                  *
                  * Chama a função da busca
                  *
                  *--------------------------------------------------------------------------------------
                  */
                  resultados.buscar($("#busca").val(), (parseInt(resultados.getPosicaoAtual()) - 1)*resultados.quantidade_por_pagina, resultados.quantidade_por_pagina);
                break;
                
              case 'Proximo':
                  resultados.setPosicaoAtual(parseInt(resultados.getPosicaoAtual()) + 1);
                  
                  /*
                  *--------------------------------------------------------------------------------------
                  *
                  * Chama a função da busca
                  *
                  *--------------------------------------------------------------------------------------
                  */
                  resultados.buscar($("#busca").val(), (parseInt(resultados.getPosicaoAtual()) - 1)*resultados.quantidade_por_pagina, resultados.quantidade_por_pagina);
                break;
                
              default:
                  resultados.setPosicaoAtual($(this).attr('data-posicao'));
                  
                  /*
                  *--------------------------------------------------------------------------------------
                  *
                  * Chama a função da busca
                  *
                  *--------------------------------------------------------------------------------------
                  */
                  resultados.buscar($("#busca").val(), $(this).attr('data-skip'),resultados.quantidade_por_pagina);
                break
            }
            
        });

      }); /* Fim $(document).ready(); */