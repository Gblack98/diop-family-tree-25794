import { Person } from "./types";

export const familyData: Person[] = [
    {"name": "Daro Wade", "genre": "Femme", "generation": 0, "parents": [], "enfants": ["Fasseck Birame Lo"]},
    {"name": "Waly Bandia Gueye", "genre": "Homme", "generation": 0, "parents": [], "enfants": ["Bakar Waly"]},
    {"name": "Charles Medor Diop", "genre": "Homme", "generation": 0, "parents": [], "enfants": ["Gabriel Birame Medor"]},
    {"name": "Bercy Ndack Ndir", "genre": "Femme", "generation": 0, "parents": [], "enfants": ["Bakar Waly", "Gabriel Birame Medor"]},
    
    // Génération 1
    {"name": "Fasseck Birame Lo", "genre": "Femme", "generation": 1, "parents": ["Daro Wade"], "enfants": ["Birame Medor Diop"]},
    {"name": "Gabriel Birame Medor", "genre": "Homme", "generation": 1, "parents": ["Charles Medor Diop", "Bercy Ndack Ndir"], "enfants": ["Birame Medor Diop"]},
    {"name": "Bakar Waly", "genre": "Homme", "generation": 1, "parents": ["Waly Bandia Gueye", "Bercy Ndack Ndir"], "enfants": []},
    
    // Génération 2
    {"name": "Birame Medor Diop", "genre": "Homme", "generation": 2, "parents": ["Fasseck Birame Lo", "Gabriel Birame Medor"], "enfants": ["Gabar Diop", "Fatou Diop Diarra", "Katy", "Magne", "Dieme Medor Dagana", "Amadou Diop Bercy"]},
    {"name": "Diarra Ba", "genre": "Femme", "generation": 2, "parents": [], "enfants": ["Gabar Diop", "Fatou Diop Diarra", "Diarra Diallo", "Iba Diallo"]},
    {"name": "Bilal Diallo", "genre": "Homme", "generation": 2, "parents": [], "enfants": ["Diarra Diallo", "Iba Diallo"]},
    
    // Génération 3
    {"name": "Gabar Diop", "genre": "Homme", "generation": 3, "parents": ["Birame Medor Diop", "Diarra Ba"], "enfants": ["Alioune Badara Gabar Diop", "Amadou Bamba Diop", "Ibrahima Gabar Diop", "Doudou Yaye Katy Diop", "Faty Dia Mbacke Diop"]},
    {"name": "Betty Ba", "genre": "Femme", "generation": 3, "parents": [], "enfants": ["Alioune Badara Gabar Diop"]},
    {"name": "Fatou Diop Diarra", "genre": "Femme", "generation": 3, "parents": ["Birame Medor Diop", "Diarra Ba"], "enfants": ["Mame Coumba Ndiaye", "Djiby Ndiaye", "Soce Ndiaye", "Ndeye Sylvie Sene", "El Hadji Malick Ndiaye"]},
    {"name": "Katy", "genre": "Femme", "generation": 3, "parents": ["Birame Medor Diop"], "enfants": []},
    {"name": "Magne", "genre": "Femme", "generation": 3, "parents": ["Birame Medor Diop"], "enfants": []},
    {"name": "Dieme Medor Dagana", "genre": "Homme", "generation": 3, "parents": ["Birame Medor Diop"], "enfants": []},
    {"name": "Amadou Diop Bercy", "genre": "Homme", "generation": 3, "parents": ["Birame Medor Diop"], "enfants": []},
    {"name": "Diarra Diallo", "genre": "Femme", "generation": 3, "parents": ["Bilal Diallo", "Diarra Ba"], "enfants": []},
    
    
    // Génération 4
    {"name": "Alioune Badara Gabar Diop", "genre": "Homme", "generation": 4, "parents": ["Gabar Diop", "Betty Ba"], "enfants": ["Mame Diarra Diop", "Ndeye Betty Diop", "Amadou Diop (Doudou)", "Amadou Bamba Diop (Badara)", "Ndeye Salimata Diop (Badara)", "Seynabou Diop (Badara)", "Lissong Diop (Badara)", "Gabar Birame Medor Diop", "Ibrahima Gabar Diop (Badara)", "Saliou Sady Faza Diop", "El Hadji Malick Diop", "Yacine Diop", "Mouhamadou Lamine Diop"]},
    {"name": "Amadou Bamba Diop", "genre": "Homme", "generation": 4, "parents": ["Gabar Diop"], "enfants": []},
    {"name": "Ibrahima Gabar Diop", "genre": "Homme", "generation": 4, "parents": ["Gabar Diop"], "enfants": ["Mame Coumba Diop", "Aida Gabar Diop", "Aminata Diop", "Soukeyna Diop", "Hady Diop", "Fatou Mbacke Diop"]},
    {"name": "Doudou Yaye Katy Diop", "genre": "Femme", "generation": 4, "parents": ["Gabar Diop"], "enfants": []},
    {"name": "Faty Dia Mbacke Diop", "genre": "Femme", "generation": 4, "parents": ["Gabar Diop"], "enfants": []},
    {"name": "Mame Coumba Ndiaye", "genre": "Femme", "generation": 4, "parents": ["Fatou Diop Diarra"], "enfants": []},
    {"name": "Djiby Ndiaye", "genre": "Homme", "generation": 4, "parents": ["Fatou Diop Diarra"], "enfants": []},
    {"name": "Soce Ndiaye", "genre": "Homme", "generation": 4, "parents": ["Fatou Diop Diarra"], "enfants": []},
    {"name": "Ndeye Sylvie Sene", "genre": "Femme", "generation": 4, "parents": ["Fatou Diop Diarra"], "enfants": []},
    {"name": "El Hadji Malick Ndiaye", "genre": "Homme", "generation": 4, "parents": ["Fatou Diop Diarra"], "enfants": ["Feu Papa Gabar Ndiaye", "Feu Pape Charles", "Djibril", "Fatou Iba"]},
    {"name": "Fatou Mbaye", "genre": "Femme", "generation": 4, "parents": [], "enfants": ["Feu Papa Gabar Ndiaye", "Feu Pape Charles", "Djibril", "Fatou Iba"]},
    {"name": "Iba Diallo", "genre": "Homme", "generation": 4, "parents": ["Diarra Ba", "Bilal Diallo"], "enfants": ["Fatou Diallo", "Moustapha Diallo", "Mame Diarra Diallo (Bineta Sarr)", "Souleymane Diallo"]},
    {"name": "Binta Sarr", "genre": "Femme", "generation": 4, "parents": [], "enfants": ["Mame Diarra Diallo (Bineta Sarr)", "Fatou Diallo", "Moustapha Diallo", "Souleymane Diallo"]},
    {"name": "Mar Seck", "genre": "Homme", "generation": 4, "parents": [], "enfants": ["Pathe Seck"]},
    {"name": "Marieme Ndiaye", "genre": "Femme", "generation": 4, "parents": [], "enfants": ["Pathe Seck"]},
    
    // Génération 5
    {"name": "Mame Diarra Diop", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": ["Djiby Kane", "Pape Kane Modiallo", "Ndeye Maguette Kane", "Ndeye Ndiebou Sow", "Nguissaly Fall", "Badara Gabar Sow"]},






    {"name": "Pape Diop", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Abdoulaye Diop (Betty)", "Aminata Diop (Betty)", "El Hadj Malick Diop (Ndeye Betty)"]},
    {"name": "Ndeye Betty Diop", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": ["Astou Diagne", "Mbaye Diagne", "Seynabou Diagne", "Pape Assane Diagne", "Fatou Diagne", "Badara Gabar Diagne", "Serigne MBacke Diagne", "Abdoulaye Diop (Betty)", "Aminata Diop (Betty)", "El Hadj Malick Diop (Ndeye Betty)"]},
    {"name": "Mbacké Diagne", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Astou Diagne", "Mbaye Diagne", "Seynabou Diagne", "Pape Assane Diagne", "Fatou Diagne", "Badara Gabar Diagne", "Serigne MBacke Diagne"]},





    {"name": "Amy Colé Diallo", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Lissong Diop (Doudou)"]},
    {"name": "Amadou Diop (Doudou)", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": ["Lamine Diop", "Marie Diagne Diop", "Marie Madeleine Diop", "Lissong Diop (Doudou)", "Ndeye Khar Diop", "Astou Diop (Doudou)", "Badara Gabar Diop (Doudou)", "Ndeye Fatou Diop (Doudou)", "Ahmadou Bamba Diop"]}, 
    {"name": "Fatou Goudiaby", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Lamine Diop", "Marie Diagne Diop", "Marie Madeleine Diop"]},
    {"name": "Mariéme Wade", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Ndeye Khar Diop"]},
    {"name": "Aita Diagne", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Astou Diop (Doudou)", "Badara Gabar Diop (Doudou)"]},
    {"name": "Rama", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Ndeye Fatou Diop", "Ahmadou Bamba Diop"]},





    {"name": "Nafissatou Seck", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Magatte Diop"]},
    {"name": "Khady Ba", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Betty Bamba Diop", "Bassirou Bamba Diop", "Badara Gabar Diop (Khady)", "Abdoulaye Diop (Khady)"]},
    {"name": "Amadou Bamba Diop (Badara)", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": ["Magatte Diop", "Betty Bamba Diop", "Bassirou Bamba Diop", "Badara Gabar Diop (Khady)", "Abdoulaye Diop (Khady)", "Aminata Diop (Bamba)", "Mame Assane Diop", "Seynabou Diop (Bamba)", "Ndeye Sokhna Diop", "Soukeyna Diop (Bamba)", "Ndeye Maguette Diop", "Ousmane Diop", "Pape Gabar Diop", "Cheikh Diop", "Fatou Cissé Diop (Bamba)", "Soda Diop", "Astou Diop (Bamba)", "Saliou Faza Diop", "Ahmadou Diop (Bamba)", "Moustapha Diop (Bamba)", "Abdou Salam Diop (Bamba)"]},
    {"name": "Mame Ngoné Dieng", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Aminata Diop (Bamba)", "Mame Assane Diop", "Seynabou Diop (Bamba)", "Ndeye Sokhna Diop", "Soukeyna Diop (Bamba)","Ndeye Maguette Diop"]},
    {"name": "Ndeye Ndiaye", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Cheikh Diop", "Soda Diop","Astou Diop (Bamba)", "Moustapha Diop (Bamba)", "Pape Gabar Diop","Fatou Cissé Diop (Bamba)","Saliou Faza Diop","Ahmadou Diop (Bamba)","Abdou Salam Diop (Bamba)", "Ousmane Diop"]},




    {"name": "Mansour Diop", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Cheikh Tidiane Diop", "Nafissatou Diop", "Ndeye Fatou Diop (Salimata)", "Pape Ousmane Diop", "Mame Makhtar Diop", "Amadou Diop (Diobé)", "Seynabou Diop (Salimata)"]},
    {"name": "Ndeye Salimata Diop (Badara)", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": ["Amadou Lamine Thiam", "Cheikh Tidiane Diop", "Nafissatou Diop", "Ndeye Fatou Diop (Salimata)", "Pape Ousmane Diop", "Mame Makhtar Diop", "Amadou Diop (Diobé)", "Seynabou Diop (Salimata)"]},
    {"name": "Samba Thiam", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Amadou Lamine Thiam"]},




    {"name": "Seynabou Diop (Badara)", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": []},



    {"name": "Abdoulaye Douta Seck", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Marie Louise Fatimata Douta Seck"]},
    {"name": "Lissong Diop (Badara)", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": ["Al Housseynou Seck", "Assietou Seck", "Ndeye Maguette Seck", "Sokhna Seck", "Mame Fatou Seck", "Marie Louise Fatimata Douta Seck", "Thiane Kharaachi Diagne"]},
    {"name": "Amadou Lamine Seck", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Al Housseynou Seck", "Assietou Seck", "Ndeye Maguette Seck", "Sokhna Seck", "Mame Fatou Seck"]},
    {"name": "Sidy Kharaachi Diagne", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Thiane Kharaachi Diagne"]},




    {"name": "Aida Gaye", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Mame Betty Gabar Diop", "El Hadj Malick Diop (Gabar Birame)", "Badara Gabar Diop (Aida)"]},
    {"name": "Gabar Birame Medor Diop", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": ["Amadou Diop (Fatou)", "Ahmadou Diop (Fatou)", "Mame Betty Gabar Diop", "El Hadj Malick Diop (Gabar Birame)", "Badara Gabar Diop (Aida)"]},
    {"name": "Fatou Gueye", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Amadou Diop (Fatou)", "Ahmadou Diop (Fatou)"]},





    {"name": "Katy Wade", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Moustapha Gabar Diop", "Marieme Fatou Diop (Katy)", "Aissatou Gabar Diop"]},
    {"name": "Ibrahima Gabar Diop (Badara)", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": ["Aida Gabar Diop (Faboye)", "Faboye Ndoumbé Diop", "Moustapha Gabar Diop", "Marieme Fatou Diop (Katy)", "Aissatou Gabar Diop"]},
    {"name": "Faboye Ndoumbé Cissé", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Aida Gabar Diop (Faboye)", "Faboye Ndoumbé Diop"]},
 



    {"name": "Saliou Sady Faza Diop", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": ["Mouhamed Hady Diop", "Mame Ndiobasse Diop", "El Hadj Malick Diop (Saliou Sady)", "Papa Oumar Thiam Diop"]},
    {"name": "Mame Penda Ndiaye", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Mouhamed Hady Diop", "Mame Ndiobasse Diop", "El Hadj Malick Diop (Saliou Sady)", "Papa Oumar Thiam Diop"]},
  



    {"name": "El Hadji Malick Diop", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": []},



    {"name": "Moctar Sall", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Sophie Sall", "Badara Gabar Sall", "Lamine Sall"]},
    {"name": "Yacine Diop", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": ["Makha Seck", "Penda Seck", "Sophie Sall", "Badara Gabar Sall", "Lamine Sall"]},
    {"name": "Pathe Seck", "genre": "Homme", "generation": 5, "parents": ["Mar Seck","Marieme Ndiaye"], "enfants": ["Makha Seck", "Penda Seck"]},



    {"name": "Madeleine Tamba", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Seynabou Diop (Lamine)", "Aida Gaye Diop", "Fabaye Diop", "Lissong Diop (Lamine)"]},
    {"name": "Mouhamadou Lamine Diop", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop"], "enfants": ["Abibatou Diop", "Marieme Fatou Diop (Bineta)", "Diogomaye Diop", "Seynabou Diop (Lamine)", "Aida Gaye Diop", "Fabaye Diop", "Lissong Diop (Lamine)"]},
    {"name": "Mame Bineta Lo", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Abibatou Diop", "Marieme Fatou Diop (Bineta)", "Diogomaye Diop"]},






    {"name": "Mame Coumba Diop", "genre": "Femme", "generation": 5, "parents": ["Ibrahima Gabar Diop"], "enfants": []},
    {"name": "Aida Gabar Diop", "genre": "Femme", "generation": 5, "parents": ["Ibrahima Gabar Diop"], "enfants": []},
    {"name": "Aminata Diop", "genre": "Femme", "generation": 5, "parents": ["Ibrahima Gabar Diop"], "enfants": []},
    {"name": "Soukeyna Diop", "genre": "Femme", "generation": 5, "parents": ["Ibrahima Gabar Diop"], "enfants": []},
    {"name": "Hady Diop", "genre": "Homme", "generation": 5, "parents": ["Ibrahima Gabar Diop"], "enfants": []},
    {"name": "Fatou Mbacke Diop", "genre": "Femme", "generation": 5, "parents": ["Ibrahima Gabar Diop"], "enfants": []},
   
   
   
    {"name": "Feu Papa Gabar Ndiaye", "genre": "Homme", "generation": 5, "parents": ["El Hadji Malick Ndiaye", "Fatou Mbaye"], "enfants": []},
    {"name": "Feu Pape Charles", "genre": "Homme", "generation": 5, "parents": ["El Hadji Malick Ndiaye", "Fatou Mbaye"], "enfants": []},
    {"name": "Djibril", "genre": "Homme", "generation": 5, "parents": ["El Hadji Malick Ndiaye", "Fatou Mbaye"], "enfants": []},
    {"name": "Fatou Iba", "genre": "Femme", "generation": 5, "parents": ["El Hadji Malick Ndiaye", "Fatou Mbaye"], "enfants": []},
    
    
    
    {"name": "Fatou Diallo", "genre": "Femme", "generation": 5, "parents": ["Iba Diallo", "Binta Sarr"], "enfants": []},
    {"name": "Moustapha Diallo", "genre": "Homme", "generation": 5, "parents": ["Iba Diallo"], "enfants": []},
    {"name": "Mame Diarra Diallo (Bineta Sarr)", "genre": "Femme", "generation": 5, "parents": ["Iba Diallo", "Binta Sarr"], "enfants": []},
    {"name": "Souleymane Diallo", "genre": "Homme", "generation": 5, "parents": ["Iba Diallo"], "enfants": []},






// Génération 6
// Yacine Diop et ses enfants

  {"name": "Makha Seck", "genre": "Homme", "generation": 6, "parents": ["Yacine Diop", "Pathe Seck"], "enfants": []},
  {"name": "Penda Seck", "genre": "Femme", "generation": 6, "parents": ["Yacine Diop"], "enfants": []},
  {"name": "Sophie Sall", "genre": "Femme", "generation": 6, "parents": ["Yacine Diop", "Moctar Sall"], "enfants": []},
  {"name": "Badara Gabar Sall", "genre": "Homme", "generation": 6, "parents": ["Yacine Diop", "Moctar Sall"], "enfants": []},
  {"name": "Lamine Sall", "genre": "Homme", "generation": 6, "parents": ["Yacine Diop", "Moctar Sall"], "enfants": []},


// Mouhamadou Lamine Diop et ses enfants
  
  {"name": "Abibatou Diop", "genre": "Femme", "generation": 6, "parents": ["Mouhamadou Lamine Diop", "Mame Bineta Lo"], "enfants": []},
  {"name": "Marieme Fatou Diop (Bineta)", "genre": "Femme", "generation": 6, "parents": ["Mouhamadou Lamine Diop", "Mame Bineta Lo"], "enfants": []},
  {"name": "Diogomaye Diop", "genre": "Homme", "generation": 6, "parents": ["Mouhamadou Lamine Diop", "Mame Bineta Lo"], "enfants": []},
  {"name": "Seynabou Diop (Lamine)", "genre": "Femme", "generation": 6, "parents": ["Mouhamadou Lamine Diop", "Madeleine Tamba"], "enfants": []},
  {"name": "Aida Gaye Diop", "genre": "Femme", "generation": 6, "parents": ["Mouhamadou Lamine Diop", "Madeleine Tamba"], "enfants": []},
  {"name": "Fabaye Diop", "genre": "Homme", "generation": 6, "parents": ["Mouhamadou Lamine Diop", "Madeleine Tamba"], "enfants": []},
  {"name": "Lissong Diop (Lamine)", "genre": "Femme", "generation": 6, "parents": ["Mouhamadou Lamine Diop", "Madeleine Tamba"], "enfants": []},


// Lissong Diop et ses enfants
  {"name": "Al Housseynou Seck", "genre": "Homme", "generation": 6, "parents": ["Lissong Diop (Badara)", "Amadou Lamine Seck"], "enfants": []},
  {"name": "Assietou Seck", "genre": "Femme", "generation": 6, "parents": ["Lissong Diop (Badara)", "Amadou Lamine Seck"], "enfants": []},
  {"name": "Ndeye Maguette Seck", "genre": "Femme", "generation": 6, "parents": ["Lissong Diop (Badara)", "Amadou Lamine Seck"], "enfants": []},
  {"name": "Sokhna Seck", "genre": "Femme", "generation": 6, "parents": ["Lissong Diop (Badara)", "Amadou Lamine Seck"], "enfants": []},
  {"name": "Mame Fatou Seck", "genre": "Femme", "generation": 6, "parents": ["Lissong Diop (Badara)", "Amadou Lamine Seck"], "enfants": []},
  {"name": "Marie Louise Fatimata Douta Seck", "genre": "Femme", "generation": 6, "parents": ["Lissong Diop (Badara)", "Abdoulaye Douta Seck"], "enfants": []},
  {"name": "Thiane Kharaachi Diagne", "genre": "Femme", "generation": 6, "parents": ["Lissong Diop (Badara)", "Sidy Kharaachi Diagne"], "enfants": []},


//  Gabar Birame Medor Diop et ses enfants
  {"name": "Amadou Diop (Fatou)", "genre": "Homme", "generation": 6, "parents": ["Gabar Birame Medor Diop", "Fatou Gueye"], "enfants": []},
  {"name": "Ahmadou Diop (Fatou)", "genre": "Homme", "generation": 6, "parents": ["Gabar Birame Medor Diop", "Fatou Gueye"], "enfants": []},

  {"name": "Mame Betty Gabar Diop", "genre": "Femme", "generation": 6, "parents": ["Gabar Birame Medor Diop", "Aida Gaye"], "enfants": []},
  {"name": "El Hadj Malick Diop (Gabar Birame)", "genre": "Homme", "generation": 6, "parents": ["Gabar Birame Medor Diop", "Aida Gaye"], "enfants": []},
  {"name": "Badara Gabar Diop (Aida)", "genre": "Homme", "generation": 6, "parents": ["Gabar Birame Medor Diop", "Aida Gaye"], "enfants": []},


// Ibrahima Gabar Diop et ses enfants
  {"name": "Aida Gabar Diop (Faboye)", "genre": "Femme", "generation": 6, "parents": ["Ibrahima Gabar Diop (Badara)", "Faboye Ndoumbé Cissé"], "enfants": []},
  {"name": "Faboye Ndoumbé Diop", "genre": "Femme", "generation": 6, "parents": ["Ibrahima Gabar Diop (Badara)", "Faboye Ndoumbé Cissé"], "enfants": []},
  {"name": "Moustapha Gabar Diop", "genre": "Homme", "generation": 6, "parents": ["Ibrahima Gabar Diop (Badara)", "Katy Wade"], "enfants": []},
  {"name": "Marieme Fatou Diop (Katy)", "genre": "Femme", "generation": 6, "parents": ["Ibrahima Gabar Diop (Badara)", "Katy Wade"], "enfants": []},
  {"name": "Aissatou Gabar Diop", "genre": "Femme", "generation": 6, "parents": ["Ibrahima Gabar Diop (Badara)", "Katy Wade"], "enfants": []},

// Saliou Sady Faza Diop et ses enfants
  {"name": "Mouhamed Hady Diop", "genre": "Homme", "generation": 6, "parents": ["Saliou Sady Faza Diop", "Mame Penda Ndiaye"], "enfants": []},
  {"name": "Mame Ndiobasse Diop", "genre": "Femme", "generation": 6, "parents": ["Saliou Sady Faza Diop", "Mame Penda Ndiaye"], "enfants": []},
  {"name": "El Hadj Malick Diop (Saliou Sady)", "genre": "Homme", "generation": 6, "parents": ["Saliou Sady Faza Diop", "Mame Penda Ndiaye"], "enfants": []},
  {"name": "Papa Oumar Thiam Diop", "genre": "Homme", "generation": 6, "parents": ["Saliou Sady Faza Diop", "Mame Penda Ndiaye"], "enfants": []},

// Ndeye Salimata Diop et ses enfants

  {"name": "Amadou Lamine Thiam", "genre": "Homme", "generation": 6, "parents": ["Samba Thiam", "Ndeye Salimata Diop (Badara)"], "enfants": []},

  {"name": "Cheikh Tidiane Diop", "genre": "Homme", "generation": 6, "parents": ["Mansour Diop", "Ndeye Salimata Diop (Badara)"], "enfants": []},
  {"name": "Nafissatou Diop", "genre": "Femme", "generation": 6, "parents": ["Mansour Diop", "Ndeye Salimata Diop (Badara)"], "enfants": []},
  {"name": "Ndeye Fatou Diop (Salimata)", "genre": "Femme", "generation": 6, "parents": ["Mansour Diop", "Ndeye Salimata Diop (Badara)"], "enfants": []},
  {"name": "Pape Ousmane Diop", "genre": "Homme", "generation": 6, "parents": ["Mansour Diop", "Ndeye Salimata Diop (Badara)"], "enfants": []},
  {"name": "Mame Makhtar Diop", "genre": "Homme", "generation": 6, "parents": ["Mansour Diop", "Ndeye Salimata Diop (Badara)"], "enfants": []},
  {"name": "Amadou Diop (Diobé)", "genre": "Homme", "generation": 6, "parents": ["Mansour Diop", "Ndeye Salimata Diop (Badara)"], "enfants": []},
  {"name": "Seynabou Diop (Salimata)", "genre": "Femme", "generation": 6, "parents": ["Mansour Diop", "Ndeye Salimata Diop (Badara)"], "enfants": []},
// Mame Diarra Diop et ses enfants
  {"name": "Djiby Kane", "genre": "Homme", "generation": 6, "parents": ["Mame Diarra Diop"], "enfants": []},
  {"name": "Pape Kane Modiallo", "genre": "Homme", "generation": 6, "parents": ["Mame Diarra Diop"], "enfants": []},
  {"name": "Ndeye Maguette Kane", "genre": "Femme", "generation": 6, "parents": ["Mame Diarra Diop"], "enfants": []},
  {"name": "Ndeye Ndiebou Sow", "genre": "Femme", "generation": 6, "parents": ["Mame Diarra Diop"], "enfants": []},
  {"name": "Nguissaly Fall", "genre": "Femme", "generation": 6, "parents": ["Mame Diarra Diop"], "enfants": []},
  {"name": "Badara Gabar Sow", "genre": "Homme", "generation": 6, "parents": ["Mame Diarra Diop"], "enfants": []},

// Ndeye Betty Diop et ses enfants
  {"name": "Astou Diagne", "genre": "Femme", "generation": 6, "parents": ["Ndeye Betty Diop", "Mbacké Diagne"], "enfants": []},
  {"name": "Mbaye Diagne", "genre": "Homme", "generation": 6, "parents": ["Ndeye Betty Diop", "Mbacké Diagne"], "enfants": []},
  {"name": "Seynabou Diagne", "genre": "Femme", "generation": 6, "parents": ["Ndeye Betty Diop", "Mbacké Diagne"], "enfants": []},
  {"name": "Pape Assane Diagne", "genre": "Homme", "generation": 6, "parents": ["Ndeye Betty Diop", "Mbacké Diagne"], "enfants": []},
  {"name": "Fatou Diagne", "genre": "Femme", "generation": 6, "parents": ["Ndeye Betty Diop", "Mbacké Diagne"], "enfants": []},
  {"name": "Badara Gabar Diagne", "genre": "Homme", "generation": 6, "parents": ["Ndeye Betty Diop", "Mbacké Diagne"], "enfants": []},
  {"name": "Serigne MBacke Diagne", "genre": "Homme", "generation": 6, "parents": ["Ndeye Betty Diop", "Mbacké Diagne"], "enfants": []},

  {"name": "Abdoulaye Diop (Betty)", "genre": "Homme", "generation": 6, "parents": ["Ndeye Betty Diop", "Pape Diop"], "enfants": []},
  {"name": "Aminata Diop (Betty)", "genre": "Femme", "generation": 6, "parents": ["Ndeye Betty Diop", "Pape Diop"], "enfants": []},
  {"name": "El Hadj Malick Diop (Ndeye Betty)", "genre": "Homme", "generation": 6, "parents": ["Ndeye Betty Diop", "Pape Diop"], "enfants": []},


// Amadou Diop (Doudou) et ses enfants
  {"name": "Lamine Diop", "genre": "Homme", "generation": 6, "parents": ["Amadou Diop (Doudou)", "Fatou Goudiaby"], "enfants": []},
  {"name": "Marie Diagne Diop", "genre": "Homme", "generation": 6, "parents": ["Amadou Diop (Doudou)", "Fatou Goudiaby"], "enfants": []},
  {"name": "Marie Madeleine Diop", "genre": "Femme", "generation": 6, "parents": ["Amadou Diop (Doudou)", "Fatou Goudiaby"], "enfants": []},

  {"name": "Lissong Diop (Doudou)", "genre": "Femme", "generation": 6, "parents": ["Amadou Diop (Doudou)", "Amy Colé Diallo"], "enfants": []},
  {"name": "Ndeye Khar Diop", "genre": "Femme", "generation": 6, "parents": ["Amadou Diop (Doudou)", "Mariéme Wade"], "enfants": []},
  {"name": "Astou Diop (Doudou)", "genre": "Femme", "generation": 6, "parents": ["Amadou Diop (Doudou)", "Aita Diagne"], "enfants": []},
  {"name": "Badara Gabar Diop (Doudou)", "genre": "Homme", "generation": 6, "parents": ["Amadou Diop (Doudou)", "Aita Diagne"], "enfants": []},

  {"name": "Ndeye Fatou Diop (Doudou)", "genre": "Femme", "generation": 6, "parents": ["Amadou Diop (Doudou)", "Rama"], "enfants": []},
  {"name": "Ahmadou Bamba Diop", "genre": "Homme", "generation": 6, "parents": ["Amadou Diop (Doudou)", "Rama"], "enfants": []},


// Amadou Bamba Diop et ses enfants

  {"name": "Magatte Diop", "genre": "Femme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Nafissatou Seck"], "enfants": []},


  {"name": "Betty Bamba Diop", "genre": "Homme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Khady Ba"], "enfants": []},
  {"name": "Bassirou Bamba Diop", "genre": "Femme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Khady Ba"], "enfants": []},
  {"name": "Badara Gabar Diop (Khady)", "genre": "Homme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Khady Ba"], "enfants": []},
  {"name": "Abdoulaye Diop (Khady)", "genre": "Homme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Khady Ba"], "enfants": []},



  {"name": "Aminata Diop (Bamba)", "genre": "Femme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Mame Ngoné Dieng"], "enfants": []},
  {"name": "Mame Assane Diop", "genre": "Femme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Mame Ngoné Dieng"], "enfants": []},
  {"name": "Seynabou Diop (Bamba)", "genre": "Femme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Mame Ngoné Dieng"], "enfants": []},
  {"name": "Soukeyna Diop (Bamba)", "genre": "Femme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Mame Ngoné Dieng"], "enfants": []},
  {"name": "Ndeye Sokhna Diop", "genre": "Femme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Mame Ngoné Dieng"], "enfants": []},
  {"name": "Ndeye Maguette Diop", "genre": "Femme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Mame Ngoné Dieng"], "enfants": []},



  {"name": "Pape Gabar Diop", "genre": "Homme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Ndeye Ndiaye"], "enfants": []},
  {"name": "Cheikh Diop", "genre": "Homme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Ndeye Ndiaye"], "enfants": []},
  {"name": "Fatou Cissé Diop (Bamba)", "genre": "Femme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Ndeye Ndiaye"], "enfants": []},
  {"name": "Ousmane Diop", "genre": "Homme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Ndeye Ndiaye"], "enfants": []},
  {"name": "Soda Diop", "genre": "Femme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Ndeye Ndiaye"], "enfants": []},

  {"name": "Astou Diop (Bamba)", "genre": "Femme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Ndeye Ndiaye"], "enfants": []},
  {"name": "Saliou Faza Diop", "genre": "Homme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Ndeye Ndiaye"], "enfants": []},
  {"name": "Ahmadou Diop (Bamba)", "genre": "Homme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Ndeye Ndiaye"], "enfants": []},
  {"name": "Moustapha Diop (Bamba)", "genre": "Homme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Ndeye Ndiaye"], "enfants": []},
  {"name": "Abdou Salam Diop (Bamba)", "genre": "Homme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Ndeye Ndiaye"], "enfants": []},

];

