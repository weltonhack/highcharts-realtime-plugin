# highcharts-realtime-plugin
O highcharts pode se tornar um gargalo em aplicações de dashboards realtime com muitos gráficos e séries que são atualizados constantemente com novos pontos. O plugin faz a atualização de todos os charts da página em round robin com um intervalo de tempo pré-determinado. Isso mantém estável o consumo de CPU no cliente e permite que a interface mantenha-se responsiva mesmo com diversos gráficos com muitas séries e pontos. Além disso, recria os gráficos a cada N ciclos de redraw (configurável), mitigando assim os memory leaks . O plugin foi testado para um case de 10 charts com 10 séries de 1000 pontos cada, com stock chart.

O plugin define um novo componente chamado Updater. Para ativá-lo,  basta invocar o  método  Highcharts.updater.start(). Para pará-lo basta invocar Highcharts.updater.stop(). Para configurá-lo utilize os seguintes parâmetros:

- Highcharts.updater.interval : intervalo de atualização dos charts, em milisegundos (default 1000);
- Highcharts.updater.cycles : numero de ciclos de atualização antes que os charts sejam recriados (default 60);
 
Ex.:

<pre>
&lt;html&gt;
&lt;body&gt;
...

&lt;script&gt;
  $(document).ready(function() {
    //criacao dos charts aqui
    ...
  
    //inicializacao do updater
    Highcharts.updater.interval = 2000;
    Highcharts.updater.cycles = 30;
    Highcharts.updater.start();
  });
&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
</pre>
