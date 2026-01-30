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

    // Ancêtres de Binta Yama Seck (Génération 2)
    {"name": "Ndiogou Seck", "genre": "Homme", "generation": 2, "parents": [], "enfants": ["Yatma Seck"]},
    {"name": "Mota Sarr", "genre": "Femme", "generation": 2, "parents": [], "enfants": ["Yatma Seck"]},
    {"name": "William Diouf", "genre": "Homme", "generation": 2, "parents": [], "enfants": ["Oulimata Diouf"]},
    
    // Génération 3
    {"name": "Gabar Diop", "genre": "Homme", "generation": 3, "parents": ["Birame Medor Diop", "Diarra Ba"], "enfants": ["Alioune Badara Gabar Diop", "Amadou Bamba Diop", "Ibrahima Gabar Diop", "Doudou Yaye Katy Diop", "Faty Dia Mbacke Diop"]},

    // Ancêtres de Mar Seck (lignée Seck)
    {"name": "Yatma Seck", "genre": "Homme", "generation": 3, "parents": ["Ndiogou Seck", "Mota Sarr"], "enfants": ["Mar Seck"]},
    {"name": "Oulimata Diouf", "genre": "Femme", "generation": 3, "parents": ["William Diouf"], "enfants": ["Mar Seck", "Iba Diagne"]},
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
    {"name": "Mar Seck", "genre": "Homme", "generation": 4, "parents": ["Yatma Seck", "Oulimata Diouf"], "enfants": ["Binta Yama Seck", "Nafissatou Seck", "Aminta Seck", "Mouhamadou Moustapha Seck", "Pathe Seck", "Penda Ndiaye Seck", "Mame Aida Seck"]},
    {"name": "Marieme Ndiaye", "genre": "Femme", "generation": 4, "parents": ["Fatou Diallo"], "enfants": ["Binta Yama Seck", "Nafissatou Seck", "Aminta Seck", "Mouhamadou Moustapha Seck", "Pathe Seck", "Penda Ndiaye Seck", "Mame Aida Seck"]},
    {"name": "Iba Diagne", "genre": "Homme", "generation": 4, "parents": ["Oulimata Diouf"], "enfants": ["Mamadou Diagne"]},
    
    // Épouses d'Alioune Badara Gabar Diop (Génération 4)
    {"name": "Seynabou Ndoye", "genre": "Femme", "generation": 4, "parents": [], "enfants": ["Mame Diarra Diop", "Ndeye Betty Diop"]},
    {"name": "Fatou Cissé", "genre": "Femme", "generation": 4, "parents": [], "enfants": ["Amadou Diop (Doudou)", "Amadou Bamba Diop (Badara)", "Ndeye Salimata Diop (Badara)", "Seynabou Diop (Badara)"]},
    {"name": "Fatou Gaye", "genre": "Femme", "generation": 4, "parents": [], "enfants": ["Lissong Diop (Badara)", "Gabar Birame Medor Diop", "Ibrahima Gabar Diop (Badara)", "Saliou Sady Faza Diop", "El Hadji Malick Diop", "Yacine Diop", "Mouhamadou Lamine Diop"]},

    // Génération 5
    {"name": "Mame Diarra Diop", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Seynabou Ndoye"], "enfants": ["Djiby Kane", "Pape Kane Modiallo", "Ndeye Maguette Kane", "Ndeye Ndiebou Sow", "Nguissaly Fall", "Badara Gabar Sow"]},






    {"name": "Pape Diop", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Abdoulaye Diop (Betty)", "Aminata Diop (Betty)", "El Hadj Malick Diop (Ndeye Betty)"]},
    {"name": "Ndeye Betty Diop", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Seynabou Ndoye"], "enfants": ["Astou Diagne", "Mbaye Diagne", "Seynabou Diagne", "Pape Assane Diagne", "Fatou Diagne", "Badara Gabar Diagne", "Serigne MBacke Diagne", "Abdoulaye Diop (Betty)", "Aminata Diop (Betty)", "El Hadj Malick Diop (Ndeye Betty)"]},
    {"name": "Mbacké Diagne", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Astou Diagne", "Mbaye Diagne", "Seynabou Diagne", "Pape Assane Diagne", "Fatou Diagne", "Badara Gabar Diagne", "Serigne MBacke Diagne"]},





    {"name": "Amy Colé Diallo", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Lissong Diop (Doudou)"]},
    {"name": "Amadou Diop (Doudou)", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Fatou Cissé"], "enfants": ["Lamine Diop", "Marie Diagne Diop", "Marie Madeleine Diop", "Lissong Diop (Doudou)", "Ndeye Khar Diop", "Astou Diop (Doudou)", "Badara Gabar Diop (Doudou)", "Ndeye Fatou Diop (Doudou)", "Ahmadou Bamba Diop"]}, 
    {"name": "Fatou Goudiaby", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Lamine Diop", "Marie Diagne Diop", "Marie Madeleine Diop"]},
    {"name": "Mariéme Wade", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Ndeye Khar Diop"]},
    {"name": "Aita Diagne", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Astou Diop (Doudou)", "Badara Gabar Diop (Doudou)"]},
    {"name": "Rama", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Ndeye Fatou Diop (Doudou)", "Ahmadou Bamba Diop"]},





    // Enfants de Mar Seck et Marieme Ndiaye
    {"name": "Binta Yama Seck", "genre": "Femme", "generation": 5, "parents": ["Mar Seck", "Marieme Ndiaye"], "enfants": ["Ndeye Wouly Diagne", "Pape Mar Diagne", "Idrissa Diagne", "Mouhamadou Tidjane Diagne", "Madjiguene Diagne", "Makhtar Diagne (Binta)", "Moussa Diagne", "Diarra Diagne", "Yatma Diagne", "Nafissatou Diagne (Binta)", "Mame Aida Diagne"]},
    {"name": "Nafissatou Seck", "genre": "Femme", "generation": 5, "parents": ["Mar Seck", "Marieme Ndiaye"], "enfants": ["Magatte Diop", "Mame Aissatou Diedhiou", "Magatte Fall Diedhiou", "Fatou Nene Diedhiou", "Alphousseynou Diedhiou", "Assane Diedhiou", "Ismaila Diedhiou", "Mouhameth Diedhiou"]},
    {"name": "Aminta Seck", "genre": "Femme", "generation": 5, "parents": ["Mar Seck", "Marieme Ndiaye"], "enfants": []},
    {"name": "Mouhamadou Moustapha Seck", "genre": "Homme", "generation": 5, "parents": ["Mar Seck", "Marieme Ndiaye"], "enfants": []},
    {"name": "Penda Ndiaye Seck", "genre": "Femme", "generation": 5, "parents": ["Mar Seck", "Marieme Ndiaye"], "enfants": []},
    {"name": "Mame Aida Seck", "genre": "Femme", "generation": 5, "parents": ["Mar Seck", "Marieme Ndiaye"], "enfants": []},

    // Époux de Binta Yama Seck
    {"name": "Mamadou Diagne", "genre": "Homme", "generation": 5, "parents": ["Iba Diagne"], "enfants": ["Ndeye Wouly Diagne", "Pape Mar Diagne", "Moussa Diagne", "Diarra Diagne", "Yatma Diagne", "Nafissatou Diagne (Binta)", "Mame Aida Diagne"]},
    {"name": "Khady Ba", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Betty Bamba Diop", "Bassirou Bamba Diop", "Badara Gabar Diop (Khady)", "Abdoulaye Diop (Khady)"]},
    {"name": "Amadou Bamba Diop (Badara)", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Fatou Cissé"], "enfants": ["Magatte Diop", "Betty Bamba Diop", "Bassirou Bamba Diop", "Badara Gabar Diop (Khady)", "Abdoulaye Diop (Khady)", "Aminata Diop (Bamba)", "Mame Assane Diop", "Seynabou Diop (Bamba)", "Ndeye Sokhna Diop", "Soukeyna Diop (Bamba)", "Ndeye Maguette Diop", "Ousmane Diop", "Pape Gabar Diop", "Cheikh Diop", "Fatou Cissé Diop (Bamba)", "Soda Diop", "Astou Diop (Bamba)", "Saliou Faza Diop", "Ahmadou Diop (Bamba)", "Moustapha Diop (Bamba)", "Abdou Salam Diop (Bamba)"]},
    {"name": "Mame Ngoné Dieng", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Aminata Diop (Bamba)", "Mame Assane Diop", "Seynabou Diop (Bamba)", "Ndeye Sokhna Diop", "Soukeyna Diop (Bamba)","Ndeye Maguette Diop"]},
    {"name": "Ndeye Ndiaye", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Cheikh Diop", "Soda Diop","Astou Diop (Bamba)", "Moustapha Diop (Bamba)", "Pape Gabar Diop","Fatou Cissé Diop (Bamba)","Saliou Faza Diop","Ahmadou Diop (Bamba)","Abdou Salam Diop (Bamba)", "Ousmane Diop"]},




    {"name": "Mansour Diop", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Cheikh Tidiane Diop", "Nafissatou Diop", "Ndeye Fatou Diop (Salimata)", "Pape Ousmane Diop", "Mame Makhtar Diop", "Amadou Diop (Diobé)", "Seynabou Diop (Salimata)"]},
    {"name": "Ndeye Salimata Diop (Badara)", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Fatou Cissé"], "enfants": ["Amadou Lamine Thiam", "Cheikh Tidiane Diop", "Nafissatou Diop", "Ndeye Fatou Diop (Salimata)", "Pape Ousmane Diop", "Mame Makhtar Diop", "Amadou Diop (Diobé)", "Seynabou Diop (Salimata)"]},
    {"name": "Samba Thiam", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Amadou Lamine Thiam"]},




    {"name": "Seynabou Diop (Badara)", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Fatou Cissé"], "enfants": []},



    {"name": "Abdoulaye Douta Seck", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Marie Louise Fatimata Douta Seck"]},
    {"name": "Lissong Diop (Badara)", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Fatou Gaye"], "enfants": ["Al Housseynou Seck", "Assietou Seck", "Ndeye Maguette Seck", "Sokhna Seck", "Mame Fatou Seck", "Marie Louise Fatimata Douta Seck", "Thiane Kharaachi Diagne"]},
    {"name": "Amadou Lamine Seck", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Al Housseynou Seck", "Assietou Seck", "Ndeye Maguette Seck", "Sokhna Seck", "Mame Fatou Seck"]},
    {"name": "Sidy Kharaachi Diagne", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Thiane Kharaachi Diagne"]},




    {"name": "Aida Gaye", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Mame Betty Gabar Diop", "El Hadj Malick Diop (Gabar Birame)", "Badara Gabar Diop (Aida)"]},
    {"name": "Gabar Birame Medor Diop", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Fatou Gaye"], "enfants": ["Amadou Diop (Fatou)", "Ahmadou Diop (Fatou)", "Mame Betty Gabar Diop", "El Hadj Malick Diop (Gabar Birame)", "Badara Gabar Diop (Aida)"]},
    {"name": "Fatou Gueye", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Amadou Diop (Fatou)", "Ahmadou Diop (Fatou)"]},





    {"name": "Katy Wade", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Moustapha Gabar Diop", "Marieme Fatou Diop (Katy)", "Aissatou Gabar Diop"]},
    {"name": "Ibrahima Gabar Diop (Badara)", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Fatou Gaye"], "enfants": ["Aida Gabar Diop (Faboye)", "Faboye Ndoumbé Diop", "Moustapha Gabar Diop", "Marieme Fatou Diop (Katy)", "Aissatou Gabar Diop"]},
    {"name": "Faboye Ndoumbé Cissé", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Aida Gabar Diop (Faboye)", "Faboye Ndoumbé Diop"]},
 



    {"name": "Saliou Sady Faza Diop", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Fatou Gaye"], "enfants": ["Mouhamed Hady Diop", "Mame Ndiobasse Diop", "El Hadj Malick Diop (Saliou Sady)", "Papa Oumar Thiam Diop"]},
    {"name": "Mame Penda Ndiaye", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Mouhamed Hady Diop", "Mame Ndiobasse Diop", "El Hadj Malick Diop (Saliou Sady)", "Papa Oumar Thiam Diop"]},
  



    {"name": "El Hadji Malick Diop", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Fatou Gaye"], "enfants": []},



    {"name": "Moctar Sall", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Sophie Sall", "Badara Gabar Sall", "Lamine Sall"]},
    {"name": "Yacine Diop", "genre": "Femme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Fatou Gaye"], "enfants": ["Makha Seck", "Penda Seck", "Sophie Sall", "Badara Gabar Sall", "Lamine Sall"]},
    {"name": "Pathe Seck", "genre": "Homme", "generation": 5, "parents": ["Mar Seck","Marieme Ndiaye"], "enfants": ["Makha Seck", "Penda Seck", "Sokhna Oumou Kalsoume Seck", "Pauline Seck", "Aby Seck", "Marieme Aicha Seck", "Marieme Nora Seck"]},



    {"name": "Madeleine Tamba", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Seynabou Diop (Lamine)", "Aida Gaye Diop", "Fabaye Diop", "Lissong Diop (Lamine)"]},
    {"name": "Mouhamadou Lamine Diop", "genre": "Homme", "generation": 5, "parents": ["Alioune Badara Gabar Diop", "Fatou Gaye"], "enfants": ["Abibatou Diop", "Marieme Fatou Diop (Bineta)", "Diogomaye Diop", "Seynabou Diop (Lamine)", "Aida Gaye Diop", "Fabaye Diop", "Lissong Diop (Lamine)"]},
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
    
    
    
    {"name": "Fatou Diallo", "genre": "Femme", "generation": 5, "parents": ["Iba Diallo", "Binta Sarr"], "enfants": ["Marieme Ndiaye"]},
    {"name": "Moustapha Diallo", "genre": "Homme", "generation": 5, "parents": ["Iba Diallo", "Binta Sarr"], "enfants": []},
    {"name": "Mame Diarra Diallo (Bineta Sarr)", "genre": "Femme", "generation": 5, "parents": ["Iba Diallo", "Binta Sarr"], "enfants": []},
    {"name": "Souleymane Diallo", "genre": "Homme", "generation": 5, "parents": ["Iba Diallo", "Binta Sarr"], "enfants": []},






// Génération 6
// Yacine Diop et ses enfants

  {"name": "Makha Seck", "genre": "Homme", "generation": 6, "parents": ["Yacine Diop", "Pathe Seck"], "enfants": []},
  {"name": "Penda Seck", "genre": "Femme", "generation": 6, "parents": ["Yacine Diop", "Pathe Seck"], "enfants": []},
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

  {"name": "Magatte Diop", "genre": "Homme", "generation": 6, "parents": ["Amadou Bamba Diop (Badara)", "Nafissatou Seck"], "enfants": ["Ibrahima Gabar Diop (Magatte)", "Fatou Cisse Diop (Magatte)", "Assane Gabar Diop", "Amadou Bamba Diop (Magatte)", "Lamine Gabar Diop"]},


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


// ========================================
// LIGNÉE DE BINTA YAMA SECK (1938-2020)
// ========================================

// Enfants de Binta Yama Seck et Mamadou Diagne (Génération 6)
  {"name": "Ndeye Wouly Diagne", "genre": "Femme", "generation": 6, "parents": ["Binta Yama Seck", "Mamadou Diagne"], "enfants": []},
  {"name": "Pape Mar Diagne", "genre": "Homme", "generation": 6, "parents": ["Binta Yama Seck", "Mamadou Diagne"], "enfants": []},
  {"name": "Moussa Diagne", "genre": "Homme", "generation": 6, "parents": ["Binta Yama Seck", "Mamadou Diagne"], "enfants": []},
  {"name": "Diarra Diagne", "genre": "Femme", "generation": 6, "parents": ["Binta Yama Seck", "Mamadou Diagne"], "enfants": ["Ibrahima Gabar Diop (Magatte)", "Fatou Cisse Diop (Magatte)", "Assane Gabar Diop"]},
  {"name": "Yatma Diagne", "genre": "Homme", "generation": 6, "parents": ["Binta Yama Seck", "Mamadou Diagne"], "enfants": []},
  {"name": "Nafissatou Diagne (Binta)", "genre": "Femme", "generation": 6, "parents": ["Binta Yama Seck", "Mamadou Diagne"], "enfants": []},
  {"name": "Mame Aida Diagne", "genre": "Femme", "generation": 6, "parents": ["Binta Yama Seck", "Mamadou Diagne"], "enfants": []},

// Enfants de Binta Yama Seck avec autre époux (Génération 6)
  {"name": "Idrissa Diagne", "genre": "Homme", "generation": 6, "parents": ["Binta Yama Seck"], "enfants": []},
  {"name": "Mouhamadou Tidjane Diagne", "genre": "Homme", "generation": 6, "parents": ["Binta Yama Seck"], "enfants": []},
  {"name": "Madjiguene Diagne", "genre": "Femme", "generation": 6, "parents": ["Binta Yama Seck"], "enfants": []},
  {"name": "Makhtar Diagne (Binta)", "genre": "Homme", "generation": 6, "parents": ["Binta Yama Seck"], "enfants": []},

// Petits-enfants de Binta Yama Seck (via Diarra Diagne et Magatte Diop) - Génération 7
  {"name": "Ibrahima Gabar Diop (Magatte)", "genre": "Homme", "generation": 7, "parents": ["Diarra Diagne", "Magatte Diop"], "enfants": []},
  {"name": "Fatou Cisse Diop (Magatte)", "genre": "Femme", "generation": 7, "parents": ["Diarra Diagne", "Magatte Diop"], "enfants": []},
  {"name": "Assane Gabar Diop", "genre": "Homme", "generation": 7, "parents": ["Diarra Diagne", "Magatte Diop"], "enfants": []},
  {"name": "Amadou Bamba Diop (Magatte)", "genre": "Homme", "generation": 7, "parents": ["Magatte Diop"], "enfants": []},
  {"name": "Lamine Gabar Diop", "genre": "Homme", "generation": 7, "parents": ["Magatte Diop"], "enfants": []},

// Enfants de Nafissatou Seck (sœur de Binta Yama) - Génération 6
  {"name": "Diedhiou", "genre": "Homme", "generation": 5, "parents": [], "enfants": ["Mame Aissatou Diedhiou", "Magatte Fall Diedhiou", "Fatou Nene Diedhiou", "Alphousseynou Diedhiou", "Assane Diedhiou", "Ismaila Diedhiou", "Mouhameth Diedhiou"]},
  {"name": "Mame Aissatou Diedhiou", "genre": "Femme", "generation": 6, "parents": ["Nafissatou Seck", "Diedhiou"], "enfants": []},
  {"name": "Magatte Fall Diedhiou", "genre": "Homme", "generation": 6, "parents": ["Nafissatou Seck", "Diedhiou"], "enfants": []},
  {"name": "Fatou Nene Diedhiou", "genre": "Femme", "generation": 6, "parents": ["Nafissatou Seck", "Diedhiou"], "enfants": []},
  {"name": "Alphousseynou Diedhiou", "genre": "Homme", "generation": 6, "parents": ["Nafissatou Seck", "Diedhiou"], "enfants": []},
  {"name": "Assane Diedhiou", "genre": "Homme", "generation": 6, "parents": ["Nafissatou Seck", "Diedhiou"], "enfants": []},
  {"name": "Ismaila Diedhiou", "genre": "Homme", "generation": 6, "parents": ["Nafissatou Seck", "Diedhiou"], "enfants": []},
  {"name": "Mouhameth Diedhiou", "genre": "Homme", "generation": 6, "parents": ["Nafissatou Seck", "Diedhiou"], "enfants": []},

// Enfants supplémentaires de Pathé Seck (Génération 6)
  {"name": "Ndeye Coumba Seck", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Sokhna Oumou Kalsoume Seck", "Pauline Seck", "Aby Seck", "Marieme Aicha Seck"]},
  {"name": "Laurence Ba", "genre": "Femme", "generation": 5, "parents": [], "enfants": ["Marieme Nora Seck"]},
  {"name": "Sokhna Oumou Kalsoume Seck", "genre": "Femme", "generation": 6, "parents": ["Pathe Seck", "Ndeye Coumba Seck"], "enfants": []},
  {"name": "Pauline Seck", "genre": "Femme", "generation": 6, "parents": ["Pathe Seck", "Ndeye Coumba Seck"], "enfants": []},
  {"name": "Aby Seck", "genre": "Femme", "generation": 6, "parents": ["Pathe Seck", "Ndeye Coumba Seck"], "enfants": []},
  {"name": "Marieme Aicha Seck", "genre": "Femme", "generation": 6, "parents": ["Pathe Seck", "Ndeye Coumba Seck"], "enfants": []},
  {"name": "Marieme Nora Seck", "genre": "Femme", "generation": 6, "parents": ["Pathe Seck", "Laurence Ba"], "enfants": []},

];

