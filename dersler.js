/* Tezene müfredatı. Sesler La4'e göre koma (53 koma sistemi) olarak yazılır; tel: 0 alt, 1 orta, 2 üst.
   Adım türleri: metin, soru, dinle, cal (mikrofonla perde kontrolü), akort, ritim (mikrofonla zamanlama). */
window.TEZENE_MUFREDAT = {
  seviyeler: [
    { sv: 1, ad: 'Başlangıç', ozet: 'Sazı tanıma, akort, tezene ve ilk perdeler' },
    { sv: 2, ad: 'Gelişen', ozet: 'Parmak düzeni, koma perdeleri, aksak ritim' },
    { sv: 3, ad: 'İleri', ozet: 'Makam dizileri, makam bilgisi, ileri teknikler' }
  ],
  dersler: [
    { id: 'd01', sv: 1, ad: 'Bağlamayı tanıyalım', ozet: 'Çalgının bölümleri ve teller', dk: 5, adimlar: [
      { t: 'metin', b: 'Anadolu’nun sesi', p: ['Bağlama, Anadolu’nun en yaygın telli çalgısıdır. Ahşap gövdesine tekne, teknenin üstünü kapatan ince tahtaya göğüs denir.', 'Gövdeden uzanan uzun kol saptır. Sapın üzerine bağlanmış ince bölmelere perde denir. Telleri geren ahşap çivilere burgu, tellerin göğüs üzerinde dayandığı küçük parçaya eşik denir.'], cizim: 'baglama' },
      { t: 'metin', b: 'Üç tel grubu', p: ['Bağlamanın telleri üç gruptur: alt, orta ve üst.', 'Sazı kucağınıza aldığınızda yere en yakın grup alt teldir; ezgilerin çoğu burada çalınır. Yüzünüze en yakın grup üst teldir.'], sap: [{ tel: 0, k: 0 }, { tel: 1, k: -9 }, { tel: 2, k: -31 }], pro: 'Kısa ve uzun saplı bağlamalar aynı perde mantığını kullanır; uzun sapta perde sayısı daha fazladır.' },
      { t: 'soru', s: 'Ezgilerin çoğu hangi telde çalınır?', o: ['Alt tel', 'Orta tel', 'Üst tel'], d: 0, a: 'Alt tel, sazı tutarken yere en yakın tel grubudur.' },
      { t: 'soru', s: 'Sapın üzerindeki bölmelere ne denir?', o: ['Burgu', 'Perde', 'Eşik'], d: 1, a: 'Perdeler, basıldığında sesin yüksekliğini belirleyen bölmelerdir.' }
    ] },
    { id: 'd02', sv: 1, ad: 'Oturuş, tutuş ve tezene', ozet: 'Doğru duruş ve iki elin görevi', dk: 6, adimlar: [
      { t: 'metin', b: 'Oturuş', p: ['Sırtınız dik, omuzlarınız gevşek olsun. Sazın teknesi sağ bacağınızın üzerine yaslanır, sap hafifçe yukarı doğru uzanır.', 'Sağ ön kolunuz teknenin üst kenarına rahatça dayanır. Solaksanız her şeyin tersini uygulayın; Ayarlar’dan sapı ters çevirebilirsiniz.'] },
      { t: 'metin', b: 'Tezene', p: ['Tezeneyi baş parmak ile işaret parmağı arasında tutun; ucu birkaç milimetre dışarıda kalsın.', 'Sıkı tutmayın. Vuruş koldan değil, bilekten gelen küçük hareketlerle yapılır.'] },
      { t: 'metin', b: 'Sol el', p: ['Sol elin baş parmağı sapın arkasında durur. Tele parmak ucuyla, perde çizgisinin hemen gerisinden basın.', 'Perdenin tam üstüne basarsanız ses boğuklaşır; çok geriden basarsanız tel cızırdar.'] },
      { t: 'soru', s: 'Tele perdenin neresinden basılır?', o: ['Perde çizgisinin tam üstünden', 'Perde çizgisinin hemen gerisinden', 'İki perdenin tam ortasından'], d: 1, a: 'Perdenin hemen gerisine basmak en temiz sesi verir.' }
    ] },
    { id: 'd03', sv: 1, ad: 'İlk akort', ozet: 'Bağlama düzeninde üç teli akort et', dk: 6, adimlar: [
      { t: 'metin', b: 'Bağlama düzeni', p: ['En yaygın düzende alt tel La, orta tel Sol, üst tel Re sesine akort edilir.', 'Burguyu çevirip teli gerdikçe ses incelir (tizleşir), gevşettikçe kalınlaşır (pesleşir).'], sap: [{ tel: 0, k: 0 }, { tel: 1, k: -9 }, { tel: 2, k: -31 }], pro: 'La referansı Ayarlar’dan değiştirilebilir; varsayılan 440 Hz’dir.' },
      { t: 'akort', b: 'Telleri akort edin', p: ['Her teli sırayla çalın. Gösterge yeşil yanana kadar burguyu azar azar çevirin.'] }
    ] },
    { id: 'd04', sv: 1, ad: 'Tezene vuruşu ve ilk ritim', ozet: 'Metronomla düzenli vuruş', dk: 5, adimlar: [
      { t: 'metin', b: 'Aşağı vuruş', p: ['Alt teli tezeneyle yukarıdan aşağıya doğru vurun. Bu, en temel vuruştur.', 'Amaç her vuruşun aynı güçte ve aynı aralıkta olması.'] },
      { t: 'ritim', b: 'Tık sesiyle birlikte', p: ['Metronom her tıkladığında alt tele bir kez aşağı vurun. Uygulama mikrofonla vuruşlarınızı dinleyip zamanlamanızı ölçer.'], bpm: 60, g: [4], olcu: 4 }
    ] },
    { id: 'd05', sv: 1, ad: 'İlk perdeler', ozet: 'Alt telde La, Si, Do, Re', dk: 8, adimlar: [
      { t: 'metin', b: 'Alt telde dört ses', p: ['Alt tel boşken La sesi çıkar. Sap boyunca ilerledikçe sesler incelir.', 'Aşağıda işaretli perdelere sırayla basıp çalın: La (boş), Si, Do, Re.'], sap: [{ tel: 0, k: 0 }, { tel: 0, k: 9 }, { tel: 0, k: 13 }, { tel: 0, k: 22 }] },
      { t: 'dinle', b: 'Önce dinleyin', p: ['Bu dört ses böyle duyulmalı.'], notlar: [0, 9, 13, 22] },
      { t: 'cal', b: 'Şimdi siz çalın', p: ['Ekrandaki sesi alt telde çalın. Doğru sesi duyunca uygulama sıradakine geçer.'], hedef: [{ tel: 0, k: 0 }, { tel: 0, k: 9 }, { tel: 0, k: 13 }, { tel: 0, k: 22 }] }
    ] },
    { id: 'd06', sv: 1, ad: 'İlk dizi: La’dan Mi’ye', ozet: 'Beş sesi çıkıp inmek', dk: 8, adimlar: [
      { t: 'metin', b: 'Beş ses', p: ['La – Si – Do – Re – Mi. Bu beş ses pek çok halk ezgisinin temelini oluşturur.'], sap: [{ tel: 0, k: 0 }, { tel: 0, k: 9 }, { tel: 0, k: 13 }, { tel: 0, k: 22 }, { tel: 0, k: 31 }] },
      { t: 'dinle', b: 'Dinleyin', p: ['Çıkıp inen dizi.'], notlar: [0, 9, 13, 22, 31, 22, 13, 9, 0] },
      { t: 'cal', b: 'Çıkın ve inin', p: ['Diziyi önce yukarı, sonra aşağı çalın.'], hedef: [0, 9, 13, 22, 31, 22, 13, 9, 0].map(k => ({ tel: 0, k })) },
      { t: 'soru', s: 'La’dan Mi’ye kaç ses çaldınız?', o: ['4', '5', '6'], d: 1, a: 'La, Si, Do, Re, Mi: beş ses. Buna beşli denir.' }
    ] },
    { id: 'd07', sv: 2, ad: 'Parmak düzeni', ozet: 'Hangi perdeye hangi parmak', dk: 7, adimlar: [
      { t: 'metin', b: 'Parmakları yerleştirmek', p: ['Bağlamada sol elin genellikle işaret, orta ve yüzük parmakları kullanılır; serçe parmak daha az kullanılır.', 'La–Re arası için: Si’ye işaret, Do’ya orta, Re’ye yüzük parmağı. Böylece el kaymadan dört ses çalınır.'], sap: [{ tel: 0, k: 9 }, { tel: 0, k: 13 }, { tel: 0, k: 22 }] },
      { t: 'cal', b: 'Elinizi kaydırmadan', p: ['Parmakları yerinden kaldırmadan çıkıp inin.'], hedef: [0, 9, 13, 22, 13, 9, 0].map(k => ({ tel: 0, k })) }
    ] },
    { id: 'd08', sv: 2, ad: 'Koma perdeleri', ozet: 'İki farklı Si: Si ve Si♭¹', dk: 7, adimlar: [
      { t: 'metin', b: 'Ara sesler', p: ['Bağlamada Batı müziğinde bulunmayan ara sesler vardır. Si perdesinin hemen gerisinde biraz daha pes bir Si bulunur.', 'Uygulamada bu sesi Si♭¹ diye yazarız. Üstteki küçük sayı, sesin kaç koma pes olduğunu gösterir.'], sap: [{ tel: 0, k: 8 }, { tel: 0, k: 9 }], pro: '53 koma sisteminde tam ses 9 komadır. Si♭¹, Si’den bir koma (yaklaşık 23 sent) pestir.' },
      { t: 'dinle', b: 'Farkı duyun', p: ['Si♭¹ ve Si sırayla, iki kez.'], notlar: [8, 9, 8, 9] },
      { t: 'soru', s: 'Si♭¹, Si’ye göre nasıldır?', o: ['Daha tiz', 'Biraz daha pes', 'Aynı ses'], d: 1, a: 'Si♭¹ bir koma pestir; fark küçüktür ama ezgiye bambaşka bir renk verir.' },
      { t: 'cal', b: 'İkisini de çalın', p: ['Önce Si♭¹, sonra Si.'], hedef: [{ tel: 0, k: 8 }, { tel: 0, k: 9 }], tol: 9 }
    ] },
    { id: 'd09', sv: 2, ad: 'Uşşak dörtlüsü', ozet: 'La – Si♭¹ – Do – Re', dk: 8, adimlar: [
      { t: 'metin', b: 'Türk müziğinin temel taşlarından', p: ['La – Si♭¹ – Do – Re dörtlüsüne Uşşak dörtlüsü denir. Uşşak, Bayati ve Hüseyni gibi makamların ilk dört sesi budur.'], sap: [{ tel: 0, k: 0 }, { tel: 0, k: 8 }, { tel: 0, k: 13 }, { tel: 0, k: 22 }], pro: 'Aralıklar: 8 + 5 + 9 koma.' },
      { t: 'dinle', b: 'Dinleyin', p: [''], notlar: [0, 8, 13, 22, 13, 8, 0] },
      { t: 'cal', b: 'Çalın', p: ['Si♭¹’e dikkat: Si’den biraz geride.'], hedef: [0, 8, 13, 22, 13, 8, 0].map(k => ({ tel: 0, k })), tol: 9 }
    ] },
    { id: 'd10', sv: 2, ad: 'Aksak ritim: 9/8', ozet: '2+2+2+3 gruplaması', dk: 6, adimlar: [
      { t: 'metin', b: 'Topal ritim', p: ['9/8, dokuz vuruşluk bir ölçüdür ve 2+2+2+3 diye gruplanır. Son grup bir vuruş uzun olduğu için ritim “aksar”.', 'Önce yalnız grup başlarında vurun: say “bir-iki, bir-iki, bir-iki, bir-iki-üç”.'] },
      { t: 'ritim', b: 'Grup başlarında vurun', p: ['Metronomdaki vurgulu tıklarda (her grubun ilk vuruşu) alt tele vurun.'], bpm: 160, g: [2, 2, 2, 3], olcu: 4, vur: 'grup' }
    ] },
    { id: 'd11', sv: 2, ad: 'Aşağı–yukarı tezene', ozet: 'İki yönlü vuruş', dk: 6, adimlar: [
      { t: 'metin', b: 'İki yön', p: ['Hızlı çalmanın sırrı, tezeneyi hem aşağı hem yukarı kullanmaktır. Aşağı vuruş vurgulu, yukarı vuruş daha hafif olur.'] },
      { t: 'ritim', b: 'Her tıkta bir vuruş', p: ['Tıklarda sırayla aşağı, yukarı, aşağı, yukarı vurun.'], bpm: 90, g: [2, 2], olcu: 4 }
    ] },
    { id: 'd12', sv: 3, ad: 'Hicaz dörtlüsü', ozet: 'La – Si♭⁴ – Do#⁴ – Re', dk: 8, adimlar: [
      { t: 'metin', b: 'Geniş aralık', p: ['Hicaz dörtlüsünün ortasında geniş bir aralık vardır; bu ona tanıdık, dokunaklı rengini verir.'], sap: [{ tel: 0, k: 0 }, { tel: 0, k: 5 }, { tel: 0, k: 17 }, { tel: 0, k: 22 }], pro: 'Aralıklar: 5 + 12 + 5 koma. Ortadaki 12 komalık aralığa artık ikili denir.' },
      { t: 'dinle', b: 'Dinleyin', p: [''], notlar: [0, 5, 17, 22, 17, 5, 0] },
      { t: 'cal', b: 'Çalın', p: [''], hedef: [0, 5, 17, 22, 17, 5, 0].map(k => ({ tel: 0, k })), tol: 9 }
    ] },
    { id: 'd13', sv: 3, ad: 'Hüseyni dizisi', ozet: 'Bir oktav boyunca', dk: 10, adimlar: [
      { t: 'metin', b: 'Tam dizi', p: ['Hüseyni dizisi La’dan tiz La’ya: La – Si♭¹ – Do – Re – Mi – Fa#⁴ – Sol – La.', 'Bu dizi Türk halk müziğinde çok sık duyulur.'], sap: [0, 8, 13, 22, 31, 39, 44, 53].map(k => ({ tel: 0, k })), pro: 'Hüseyni beşlisi (8+5+9+9) + Uşşak dörtlüsü (8+5+9).' },
      { t: 'dinle', b: 'Dinleyin', p: [''], notlar: [0, 8, 13, 22, 31, 39, 44, 53] },
      { t: 'cal', b: 'Çıkın', p: ['Diziyi alt telde yukarı doğru çalın.'], hedef: [0, 8, 13, 22, 31, 39, 44, 53].map(k => ({ tel: 0, k })), tol: 9 }
    ] },
    { id: 'd14', sv: 3, ad: 'Makam bilgisi', ozet: 'Karar, güçlü, dörtlü ve beşli', dk: 7, adimlar: [
      { t: 'metin', b: 'Makam nedir?', p: ['Makam; bir dizinin hangi seslerden oluştuğunu, ezginin nasıl gezindiğini ve hangi seste bittiğini anlatan kurallar bütünüdür.', 'Ezginin bittiği sese karar (durak), ezgide en çok vurgulanan ikinci sese güçlü denir.'] },
      { t: 'metin', b: 'Yapı taşları', p: ['Diziler dörtlü ve beşlilerden kurulur. Örneğin Hicaz dizisi, Hicaz dörtlüsü ile Rast beşlisinin birleşimidir.', 'Makam bölümünde her dizinin yapısını, kararını ve güçlüsünü görebilirsiniz.'] },
      { t: 'soru', s: 'Ezginin bittiği sese ne denir?', o: ['Güçlü', 'Karar', 'Yeden'], d: 1, a: 'Karar, ezginin dinlendiği ve bittiği sestir.' },
      { t: 'soru', s: 'Uşşak makamında güçlü kaçıncı derecedir?', o: ['3.', '4.', '5.'], d: 1, a: 'La kararlı Uşşak’ta güçlü Re, yani 4. derecedir.' }
    ] },
    { id: 'd15', sv: 3, ad: 'İleri teknikler', ozet: 'Çarpma, çekme ve şelpe', dk: 8, adimlar: [
      { t: 'metin', b: 'Çarpma ve çekme', p: ['Çarpma: teli çaldıktan sonra sol elin bir parmağını üst perdeye çekiç gibi indirerek ikinci sesi tezenesiz çıkarın.', 'Çekme: basılı parmağı teli hafifçe yana çekerek kaldırın; alttaki ses kendiliğinden duyulur.'] },
      { t: 'cal', b: 'Çarpma deneyin', p: ['La’yı çalın, ardından tezene kullanmadan Si’ye çarpın.'], hedef: [{ tel: 0, k: 0 }, { tel: 0, k: 9 }] },
      { t: 'metin', b: 'Şelpe', p: ['Şelpe, tezene kullanmadan iki elin parmaklarıyla tellere vurarak ve çekerek çalma tekniğidir. Bağlamaya özgü, ileri bir tekniktir.', 'Şelpeyi doğru öğrenmek için bir öğretmenle çalışmanızı öneririz; uygulama burada yalnızca tanıtım yapar.'] }
    ] }
  ],
  egzersizler: [
    { id: 'e1', sv: 1, ad: 'Boş tel vuruşu', ac: 'Alt tele her tıkta aşağı vurun. Ses eşit ve temiz olsun.', notlar: [{ tel: 0, k: 0 }], bas: 60, hedef: 100, usul: 'sofyan' },
    { id: 'e2', sv: 1, ad: 'Aşağı–yukarı', ac: 'Alt telde her tıkta bir vuruş, sırayla aşağı ve yukarı.', notlar: [{ tel: 0, k: 0 }], bas: 60, hedef: 120, usul: 'sofyan' },
    { id: 'e3', sv: 1, ad: 'La–Re yürüyüşü', ac: 'Her tıkta bir ses: çıkıp inin.', notlar: [0, 9, 13, 22, 13, 9].map(k => ({ tel: 0, k })), bas: 60, hedef: 110, usul: 'sofyan' },
    { id: 'e4', sv: 1, ad: 'Tel geçişi', ac: 'Üst, orta, alt, orta: boş teller arasında temiz geçiş.', notlar: [{ tel: 2, k: -31 }, { tel: 1, k: -9 }, { tel: 0, k: 0 }, { tel: 1, k: -9 }], bas: 60, hedef: 100, usul: 'sofyan' },
    { id: 'e5', sv: 2, ad: 'Uşşak dörtlüsü', ac: 'Si♭¹’i doğru yerde basarak çıkıp inin.', notlar: [0, 8, 13, 22, 13, 8].map(k => ({ tel: 0, k })), bas: 70, hedef: 120, usul: 'sofyan' },
    { id: 'e6', sv: 2, ad: '9/8 vuruş kalıbı', ac: 'Alt tel boş; her tıkta vurun, grup başlarını vurgulayın.', notlar: [{ tel: 0, k: 0 }], bas: 120, hedef: 220, usul: 'aksak9' },
    { id: 'e7', sv: 3, ad: 'Hicaz dörtlüsü', ac: 'Geniş aralığı temiz geçin.', notlar: [0, 5, 17, 22, 17, 5].map(k => ({ tel: 0, k })), bas: 70, hedef: 120, usul: 'sofyan' },
    { id: 'e8', sv: 3, ad: 'Perde merdiveni', ac: 'Alt telde La’dan tiz La’ya kadar bütün perdeleri sırayla çalın.', notlar: 'tum', bas: 60, hedef: 100, usul: 'sofyan' }
  ]
};
