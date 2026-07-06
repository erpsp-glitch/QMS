// // // // // package com.ERP.QMS.repository;

// // // // // import com.ERP.QMS.model.MrmAgenda;
// // // // // import org.springframework.data.jpa.repository.JpaRepository;

// // // // // import java.util.List;

// // // // // public interface MrmAgendaRepository extends JpaRepository<MrmAgenda, Long> {
// // // // //     List<MrmAgenda> findByMrmPlan_IdOrderBySerialNo(Long planId);
// // // // // }


// // // // package com.ERP.QMS.repository;

// // // // import com.ERP.QMS.model.MrmAgenda;
// // // // import org.springframework.data.jpa.repository.JpaRepository;

// // // // import java.util.List;

// // // // public interface MrmAgendaRepository extends JpaRepository<MrmAgenda, Long> {

// // // //     List<MrmAgenda> findByPlan_IdOrderBySerialNo(Long planId);

// // // // }

// // // package com.ERP.QMS.repository;

// // // import com.ERP.QMS.model.MrmAgenda;
// // // import org.springframework.data.jpa.repository.JpaRepository;
// // // import java.util.List;

// // // public interface MrmAgendaRepository extends JpaRepository<MrmAgenda, Long> {

// // //     List<MrmAgenda> findByPlan_IdOrderBySerialNo(Long planId);

// // // }


// // package com.ERP.QMS.repository;

// // import com.ERP.QMS.model.MrmAgenda;
// // import org.springframework.data.jpa.repository.JpaRepository;

// // import java.util.List;

// // public interface MrmAgendaRepository extends JpaRepository<MrmAgenda, Long> {

// //    List<MrmAgenda> findByMrmPlan_IdOrderBySerialNo(Long planId);

// // }


// package com.ERP.QMS.repository;

// import com.ERP.QMS.model.MrmAgenda;
// import org.springframework.data.jpa.repository.JpaRepository;
// import java.util.List;

// public interface MrmAgendaRepository extends JpaRepository<MrmAgenda, Long> {

//     List<MrmAgenda> findByMrmPlan_IdOrderBySerialNo(Long planId);

// }

package com.ERP.QMS.repository;

import com.ERP.QMS.model.MrmAgenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MrmAgendaRepository extends JpaRepository<MrmAgenda, Long> {

    List<MrmAgenda> findByMrmPlan_IdOrderBySerialNo(Long planId);

}